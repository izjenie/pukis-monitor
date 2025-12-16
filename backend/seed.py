"""
Script untuk membuat Super Admin user pertama
Jalankan: python backend/seed.py
"""
from app.database import SessionLocal, engine, Base
from app.models.models import User
from app.services.auth import get_password_hash

Base.metadata.create_all(bind=engine)

def seed_super_admin():
    db = SessionLocal()
    
    try:
        existing = db.query(User).filter(User.email == "superadmin@pukis.id").first()
        
        if existing:
            print("Super Admin sudah ada!")
            return
        
        super_admin = User(
            email="superadmin@pukis.id",
            first_name="Super",
            last_name="Admin",
            role="super_admin",
            password=get_password_hash("superadmin123")
        )
        
        db.add(super_admin)
        db.commit()
        
        print("Super Admin berhasil dibuat!")
        print("Email: superadmin@pukis.id")
        print("Password: superadmin123")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_super_admin()
