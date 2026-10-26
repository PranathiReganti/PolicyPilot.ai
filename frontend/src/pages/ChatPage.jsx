import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Loader2, 
  Trash2, 
  Bot, 
  User, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { chatWithAdvisor } from '../api/client';

export default function ChatPage({ initialQuery = '' }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your PolicyPilot AI Insurance Advisor. I have indexed 44+ policy documents across Health, Term, Motor, and Travel insurance. Ask me about specific clauses, maternity coverage, waiting periods for diabetes/hypertension, room rent sub-limits, or motor zero depreciation!",
      sources: []
    }
  ]);
  const [input, setInput] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatWithAdvisor(query, sessionId);
      if (res.session_id) {
        setSessionId(res.session_id);
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources || [],
        suggested: res.suggested_questions || []
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error retrieving policy documents. Please ensure the backend server is reachable.",
        sources: []
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Chat cleared. What insurance policy questions would you like to explore today?",
        sources: []
      }
    ]);
  };

  const samplePrompts = [
    "Does Star Comprehensive cover maternity expenses and what is the waiting period?",
    "What is the waiting period for pre-existing diabetes in health insurance?",
    "Which policy has the highest claim settlement ratio?",
    "What does Zero Depreciation cover in motor insurance?",
    "Does overseas travel insurance cover COVID-19 hospitalization in Schengen countries?"
  ];

  return (
    <div className="min-h-screen ombre-page-bg py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-4">
        
        {/* Chat Header */}
        <div className="bg-white rounded-3xl border border-sky-300 p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">PolicyPilot RAG Advisor</h2>
                <span className="bg-sky-50 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-300">
                  Vector RAG Active
                </span>
              </div>
              <p className="text-xs text-slate-400">Verifiable Q&A grounded in official policy terms & clauses</p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            title="Reset Chat Session"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Suggested Prompts Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Try asking:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium shrink-0 shadow-xs transition-colors hover:border-sky-400"
            >
              {prompt.length > 45 ? prompt.slice(0, 45) + '...' : prompt}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-y-auto space-y-6 max-h-[62vh]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-3xl p-5 shadow-xs ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none'
              }`}>
                {/* Message text */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Citations Box */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                      <span>Referenced Policy Citations ({msg.sources.length}):</span>
                    </div>
                    <div className="space-y-2">
                      {msg.sources.map((src, sIdx) => (
                        <div key={sIdx} className="bg-white rounded-xl p-3 border border-slate-200 text-xs text-slate-600 shadow-2xs">
                          <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                            <span>{src.policy_name}</span>
                            <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded">
                              Match: {Math.round(src.relevance_score * 100)}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 italic leading-snug">
                            "{src.relevant_clause}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>Searching FAISS vector index & analyzing clauses...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask anything (e.g. Does Care Freedom cover dialysis?)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full bg-white border border-slate-300 rounded-2xl pl-5 pr-14 py-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-md"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2.5 p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
