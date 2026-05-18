
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: str
    username: str

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# Properties to return via API
class User(UserBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None

class Task(TaskBase):
    id: int
    owner_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
