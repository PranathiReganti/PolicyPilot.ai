import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.database import engine, Base
from app.seed import seed_database
from app.routers import (
    auth_routes,
    policies_routes,
    recommender_routes,
    compare_routes,
    estimator_routes,
    chat_routes,
    history_routes,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and seed database with 44+ policies
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Startup database seeding note: {e}")
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="PolicyPilot AI - Insurance Recommendation Platform",
    description="Intelligent insurance recommendation engine, comparison, actuarial premium estimator, and RAG AI advisor.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for seamless frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local React Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routers
app.include_router(auth_routes.router)
app.include_router(policies_routes.router)
app.include_router(recommender_routes.router)
app.include_router(compare_routes.router)
app.include_router(estimator_routes.router)
app.include_router(chat_routes.router)
app.include_router(history_routes.router)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "healthy",
        "service": "PolicyPilot AI API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "supported_categories": ["health", "term", "life", "motor", "travel"]
    }
