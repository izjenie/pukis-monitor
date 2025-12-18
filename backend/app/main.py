from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from .routers import auth, outlets, sales, expenses

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("uploads/proofs", exist_ok=True)
    yield

app = FastAPI(
    title="Pukis Monitoring API",
    description="API Backend untuk aplikasi Pukis Monitoring",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
