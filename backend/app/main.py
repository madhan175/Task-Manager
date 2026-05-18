from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from .routers import users, tasks
from . import schemas

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (skip during tests)
    if os.getenv("TESTING") != "1":
        Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Task Manager API",
    description="A production-grade Task Manager API built with FastAPI and MySQL",
    version="1.0.0",
    lifespan=lifespan
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add direct root mappings to satisfy strict endpoint requirements
@app.post("/register", response_model=schemas.User, status_code=201, tags=["Root Authentication"])
def register_root(user: schemas.UserCreate, db: Session = Depends(get_db)):
    from .routers.users import register
    return register(user, db)

@app.post("/login", response_model=schemas.Token, tags=["Root Authentication"])
async def login_root(request: Request, db: Session = Depends(get_db)):
    from .routers.users import login
    return await login(request, db)

# Include routers under /api/v1 for frontend compatibility
app.include_router(users.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")

# Also include task router at root to satisfy /tasks, /tasks/{id}, etc. directly
app.include_router(tasks.router, prefix="")

@app.post("/api/v1/reset-db")
async def reset_db():
    from .database import Base, engine
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return {"message": "Database reset successfully"}

@app.get("/")
async def root():
    return {
        "message": "Welcome to Task Manager API",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
