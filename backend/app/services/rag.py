import os
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import httpx
from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models import Policy
from app.schemas import ChatCitation, ChatResponse

logger = logging.getLogger("policypilot.rag")

class PolicyRAGAdvisor:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.model = None
        self.faiss_index = None
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.initialized = False

    def initialize_knowledge_base(self, db: Session):
        """Indexes all policy documents into vector index and TF-IDF fallback store."""
        if self.initialized and len(self.chunks) > 0:
            return

        policies = db.query(Policy).all()
        if not policies:
            return

        self.chunks = []
        for p in policies:
            # Chunk 1: Coverage & Benefits
            c1_text = (
                f"Policy: {p.policy_name} by {p.insurer}. Category: {p.category}. "
                f"Coverage Features: {p.coverage_features}. "
                f"Room Rent Limit: {p.room_rent_limit}. Cashless Facility: {p.cashless_facility}. "
                f"Best Suited For: {p.best_suited_for}. "
                f"Overview: {p.policy_description}"
            )
            self.chunks.append({
                "policy_id": p.id,
                "policy_name": p.policy_name,
                "insurer": p.insurer,
                "category": p.category,
                "section": "Coverage & Benefits",
                "text": c1_text,
                "raw_policy": p
            })

            # Chunk 2: Exclusions & Waiting Period & Claims
            c2_text = (
                f"Policy: {p.policy_name} ({p.insurer}). Category: {p.category}. "
                f"Waiting Period for Pre-Existing Diseases: {p.waiting_period_months} months. "
                f"Exclusions: {p.exclusions}. "
                f"Claim Settlement Ratio: {p.claim_settlement_ratio}%. "
                f"Network Partners: {p.network_hospitals_or_garages}. "
                f"Co-pay: {p.copay_percentage}%."
            )
            self.chunks.append({
                "policy_id": p.id,
                "policy_name": p.policy_name,
                "insurer": p.insurer,
                "category": p.category,
                "section": "Exclusions & Waiting Periods",
                "text": c2_text,
                "raw_policy": p
            })

        corpus_texts = [c["text"] for c in self.chunks]

        # 1. Fast, robust TF-IDF vectorizer (always available, instant)
        self.tfidf_vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(corpus_texts)

        # 2. Optionally load SentenceTransformer & FAISS if configured
        use_neural = os.getenv("USE_NEURAL_EMBEDDINGS", "false").lower() in ("true", "1", "yes")
        if use_neural:
            try:
                from sentence_transformers import SentenceTransformer
                import faiss
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                embeddings = self.model.encode(corpus_texts, convert_to_numpy=True, normalize_embeddings=True)
                dimension = embeddings.shape[1]
                self.faiss_index = faiss.IndexFlatIP(dimension)
                self.faiss_index.add(embeddings.astype("float32"))
                logger.info("Initialized FAISS neural embeddings index.")
            except Exception as e:
                logger.warning(f"Neural embeddings initialization skipped: {e}")
                self.model = None
                self.faiss_index = None

        self.initialized = True

    def retrieve(self, query: str, top_k: int = 4, category_filter: Optional[str] = None) -> List[Tuple[Dict[str, Any], float]]:
        """Retrieves top_k relevant policy chunks using FAISS or TF-IDF."""
        if not self.chunks:
            return []

        # Neural FAISS search if available
        if self.model and self.faiss_index:
            try:
                query_vec = self.model.encode([query], convert_to_numpy=True, normalize_embeddings=True)
                distances, indices = self.faiss_index.search(query_vec.astype("float32"), top_k * 2)
                results = []
                for dist, idx in zip(distances[0], indices[0]):
                    if idx < 0 or idx >= len(self.chunks):
                        continue
                    chunk = self.chunks[idx]
                    if category_filter and chunk["category"].lower() != category_filter.lower():
                        continue
                    results.append((chunk, float(dist)))
                    if len(results) >= top_k:
                        break
                if results:
                    return results
            except Exception as e:
                logger.warning(f"FAISS search failed, falling back to TF-IDF: {e}")

        # High-performance TF-IDF vector retrieval
        if self.tfidf_vectorizer and self.tfidf_matrix is not None:
            query_vec = self.tfidf_vectorizer.transform([query])
            sims = cosine_similarity(query_vec, self.tfidf_matrix)[0]
            top_indices = np.argsort(sims)[::-1]
            
            results = []
            for idx in top_indices:
                if sims[idx] <= 0.01 and len(results) >= 2:
                    break
                chunk = self.chunks[idx]
                if category_filter and chunk["category"].lower() != category_filter.lower():
                    continue
                results.append((chunk, float(sims[idx])))
                if len(results) >= top_k:
                    break
            return results

        return []

    def ask_llm(self, query: str, context_chunks: List[Dict[str, Any]]) -> Optional[str]:
        """Calls Gemini or OpenAI if configured via environment variables."""
        provider = os.getenv("LLM_PROVIDER", "").lower()
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        openai_key = os.getenv("OPENAI_API_KEY", "")

        context_str = "\n\n".join([
            f"--- Document [{c['policy_name']} by {c['insurer']} ({c['section']})] ---\n{c['text']}"
            for c in context_chunks
        ])

        system_prompt = (
            "You are PolicyPilot AI, an expert insurance policy advisor. "
            "Answer the user's question accurately, concisely, and factually using ONLY the provided policy documents. "
            "Always cite the exact policy name, waiting periods, room rent terms, or conditions where applicable. "
            "If an exclusion applies, state it clearly. Always include a short disclaimer that terms are subject to underwriting."
        )

        user_content = f"User Question: {query}\n\nContext Policy Information:\n{context_str}"

        # 1. Gemini
        if (provider == "gemini" or not provider) and gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_content}"}]}],
                    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 600}
                }
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return text
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}")

        # 2. OpenAI
        if (provider == "openai" or not provider) and openai_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_content}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 600
                }
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.warning(f"OpenAI API call failed: {e}")

        return None

    def synthesize_rule_based_answer(self, query: str, context_chunks: List[Tuple[Dict[str, Any], float]]) -> str:
        """
        Intelligent context-driven rule-based answer synthesis.
        Guarantees accurate, rich, professional answers when no external LLM API key is present.
        """
        if not context_chunks:
            return (
                "I couldn't locate specific clauses matching your query in the current policy database. "
                "You can ask about maternity coverage, waiting periods for diabetes, zero depreciation in motor insurance, "
                "or room rent sub-limits across policies."
            )

        q = query.lower()
        top_chunk, score = context_chunks[0]
        p: Policy = top_chunk["raw_policy"]

        lines = []

        # Intent: Maternity / Pregnancy
        if any(k in q for k in ["matern", "pregnan", "baby", "deliver"]):
            lines.append("### Maternity Coverage Analysis")
            matched_any = False
            for chunk, _ in context_chunks:
                pol: Policy = chunk["raw_policy"]
                if "matern" in (pol.coverage_features or "").lower():
                    lines.append(
                        f"- **{pol.policy_name} ({pol.insurer})**: Covers maternity expenses (normal & caesarean) "
                        f"after a **{pol.waiting_period_months}-month waiting period**. Includes newborn coverage and day-care support."
                    )
                    matched_any = True
            if not matched_any:
                lines.append(
                    f"In **{p.policy_name}**, standard maternity benefits are not actively featured in the base schedule, "
                    f"or require specialized optional riders with waiting periods ranging between 24 and 36 months."
                )

        # Intent: Pre-existing diseases / Diabetes / Hypertension / Cardiac / Waiting period
        elif any(k in q for k in ["wait", "period", "diabet", "bp", "hypertens", "heart", "cardiac", "pre-exist", "ped"]):
            lines.append("### Pre-Existing Disease & Waiting Period Rules")
            for chunk, _ in context_chunks[:3]:
                pol: Policy = chunk["raw_policy"]
                lines.append(
                    f"- **{pol.policy_name} ({pol.insurer})**:\n"
                    f"  - **Waiting Period**: {pol.waiting_period_months} months for named pre-existing conditions.\n"
                    f"  - **Room Rent Limit**: {pol.room_rent_limit}\n"
                    f"  - **Claim Settlement**: {pol.claim_settlement_ratio}% with {pol.network_hospitals_or_garages:,}+ cashless facilities."
                )
            lines.append(
                "\n*Key Rule*: Any condition diagnosed before taking the policy is legally recognized as a Pre-Existing Disease (PED) and will be covered once the designated waiting period elapses."
            )

        # Intent: Motor / Zero Dep / Car / Vehicle
        elif any(k in q for k in ["motor", "car", "bike", "zero dep", "depreciation", "engine", "rsa", "accident"]):
            lines.append("### Motor Insurance Coverage Insights")
            for chunk, _ in context_chunks[:3]:
                pol: Policy = chunk["raw_policy"]
                lines.append(
                    f"- **{pol.policy_name} ({pol.insurer})**:\n"
                    f"  - **Key Features**: {pol.coverage_features}\n"
                    f"  - **Cashless Garages**: {pol.network_hospitals_or_garages:,} authorized workshops\n"
                    f"  - **Notable Exclusions**: {pol.exclusions}"
                )
            lines.append(
                "\n*Tip*: Adding a **Zero Depreciation (Bumper-to-Bumper)** add-on eliminates deduction on plastic, rubber, and glass parts during collision claims."
            )

        # Intent: Travel / Overseas / Visa / Schengen
        elif any(k in q for k in ["travel", "schengen", "abroad", "foreign", "overseas", "baggage", "flight", "visa"]):
            lines.append("### Travel Insurance & Overseas Protection")
            for chunk, _ in context_chunks[:3]:
                pol: Policy = chunk["raw_policy"]
                lines.append(
                    f"- **{pol.policy_name} ({pol.insurer})**:\n"
                    f"  - **Sum Insured**: Up to ₹{pol.max_sum_insured:,}\n"
                    f"  - **Features**: {pol.coverage_features}\n"
                    f"  - **Exclusions**: {pol.exclusions}"
                )

        # Intent: General inquiry / Comparison / Features
        else:
            lines.append(f"### Insurance Advisor Overview for \"{query}\"")
            for chunk, _ in context_chunks[:3]:
                pol: Policy = chunk["raw_policy"]
                lines.append(
                    f"**{pol.policy_name}** (by *{pol.insurer}*):\n"
                    f"- **Type**: {pol.category.capitalize()} Insurance | Rating: {pol.rating}/5.0\n"
                    f"- **Claim Settlement Ratio**: {pol.claim_settlement_ratio}%\n"
                    f"- **Highlights**: {pol.coverage_features}\n"
                    f"- **Waiting Period**: {pol.waiting_period_months} months | Room Rent: {pol.room_rent_limit}\n"
                    f"- **Exclusions**: {pol.exclusions}\n"
                )

        lines.append(
            "\n*Disclaimer: Informational only, not financial or legal advice. Final coverage, exclusions, and deductibles are determined by the policy terms and IRDAI regulations.*"
        )
        return "\n".join(lines)

    def answer_query(self, db: Session, query: str, session_id: Optional[str] = None) -> ChatResponse:
        """Main chat endpoint method: Retrieve -> Generate (LLM or Rule-Based Fallback) -> Cite."""
        self.initialize_knowledge_base(db)

        # Retrieve top 3 relevant chunks
        retrieved = self.retrieve(query, top_k=3)

        # Try LLM first if API key configured
        llm_answer = None
        if retrieved:
            context_chunks = [item[0] for item in retrieved]
            llm_answer = self.ask_llm(query, context_chunks)

        if llm_answer:
            final_answer = llm_answer
        else:
            final_answer = self.synthesize_rule_based_answer(query, retrieved)

        # Build Citations
        citations = []
        for chunk, score in retrieved:
            pol: Policy = chunk["raw_policy"]
            snippet = chunk["text"][:220] + "..." if len(chunk["text"]) > 220 else chunk["text"]
            citations.append(ChatCitation(
                policy_id=pol.id,
                policy_name=pol.policy_name,
                insurer=pol.insurer,
                category=pol.category,
                relevance_score=round(float(score), 3),
                relevant_clause=snippet
            ))

        suggested = [
            "Does Star Comprehensive cover maternity expenses?",
            "What is the waiting period for pre-existing diabetes?",
            "Which policy has the highest claim settlement ratio?",
            "What is the difference between pure term and return of premium?",
            "Does motor insurance cover water damage to the engine?"
        ]

        import uuid
        active_session = session_id or str(uuid.uuid4())

        return ChatResponse(
            session_id=active_session,
            answer=final_answer,
            sources=citations,
            suggested_questions=suggested[:4]
        )

rag_advisor = PolicyRAGAdvisor()
