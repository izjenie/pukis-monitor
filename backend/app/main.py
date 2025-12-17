from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, Base
from .routers import auth, outlets, sales, expenses, super_admin

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pukis Monitoring API",
    description="API Backend untuk aplikasi Pukis Monitoring",
    version="1.0.0"
)

origins = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    os.getenv("REPLIT_DEV_DOMAIN", ""),
    os.getenv("REPLIT_DOMAINS", ""),
]
origins = [o for o in origins if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(os.path.join(upload_dir, "proofs"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

app.include_router(auth.router)
app.include_router(outlets.router)
app.include_router(sales.router)
app.include_router(expenses.router)
app.include_router(super_admin.router)

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
