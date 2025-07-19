from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class PaginationResponse(BaseModel):
    hasMore: bool
    nextCursor: Optional[str] = None
    total: Optional[int] = None


class ErrorDetail(BaseModel):
    error: str
    message: str
    details: Optional[dict] = None


class ImageUploadResponse(BaseModel):
    url: str
    id: str


class LikeResponse(BaseModel):
    liked: bool
    likesCount: int


class SaveResponse(BaseModel):
    saved: bool
    savesCount: Optional[int] = None


class CategoryItem(BaseModel):
    id: str
    name: str
    count: int


class CategoryResponse(BaseModel):
    categories: List[CategoryItem]


class UserBasic(BaseModel):
    id: str
    name: str
    username: str
    university: str
    avatar: Optional[str] = None
    
    class Config:
        from_attributes = True