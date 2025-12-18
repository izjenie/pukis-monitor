from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from .routers import auth, outlets, sales, expenses

os.makedirs("uploads/proofs", exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title="Pukis Monitoring API",
    description="API Backend untuk aplikasi Pukis Monitoring",
    version="1.0.0",
    lifespan=lifespan
)

allowed_origins = [
    "http://localhost:5000",
    "http://localhost:3000",
    "http://127.0.0.1:5000",
]

replit_domains = os.getenv("REPLIT_DOMAINS", "")
if replit_domains:
    for domain in replit_domains.split(","):
        allowed_origins.append(f"https://{domain.strip()}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(outlets.router)
app.include_router(sales.router)
app.include_router(expenses.router)

@app.get("/")
async def root():
    return {
        "message": "Pukis Monitoring API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
