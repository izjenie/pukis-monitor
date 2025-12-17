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

def get_cors_origins():
    base_origins = [
        "http://localhost:5000",
        "http://127.0.0.1:5000",
    ]
    
    replit_dev_domain = os.getenv("REPLIT_DEV_DOMAIN", "")
    if replit_dev_domain:
        base_origins.append(f"https://{replit_dev_domain}")
    
    replit_domains = os.getenv("REPLIT_DOMAINS", "")
    if replit_domains:
        for domain in replit_domains.split(","):
            domain = domain.strip()
            if domain:
                base_origins.append(f"https://{domain}")
    
    return [o for o in base_origins if o]

origins = get_cors_origins()

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
