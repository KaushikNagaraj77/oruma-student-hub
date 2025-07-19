from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str
    email: EmailStr
    university: str


class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if len(v.strip()) > 255:
            raise ValueError('Name must be less than 255 characters')
        return v.strip()


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    
    @validator('name')
    def validate_name(cls, v):
        if v is not None:
            if len(v.strip()) < 2:
                raise ValueError('Name must be at least 2 characters long')
            if len(v.strip()) > 255:
                raise ValueError('Name must be less than 255 characters')
            return v.strip()
        return v


class UserResponse(UserBase):
    id: str
    avatar: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    university: str
    avatar: Optional[str] = None
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    refreshToken: str
    user: UserPublic


class RegisterRequest(UserCreate):
    pass


class RegisterResponse(BaseModel):
    token: str
    refreshToken: str
    user: UserPublic


class RefreshTokenRequest(BaseModel):
    refreshToken: str


class RefreshTokenResponse(BaseModel):
    token: str
    refreshToken: str