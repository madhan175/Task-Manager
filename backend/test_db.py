from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

users = db.query(User).all()
for u in users:
    print(f"User: {u.username}, Email: {u.email}, Hash: {u.hashed_password}")
