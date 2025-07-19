from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.common import PaginationResponse


class MarketplaceItemBase(BaseModel):
    title: str
    description: str
    price: float
    condition: str
    category: str
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    specifications: Optional[List[Dict[str, str]]] = None


class MarketplaceItemCreate(MarketplaceItemBase):
    images: Optional[List[str]] = None
    
    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        if len(v.strip()) > 255:
            raise ValueError('Title must be less than 255 characters')
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError('Description cannot be empty')
        if len(v.strip()) > 5000:
            raise ValueError('Description must be less than 5000 characters')
        return v.strip()
    
    @validator('price')
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('Price cannot be negative')
        if v > 999999.99:
            raise ValueError('Price cannot exceed $999,999.99')
        return v
    
    @validator('condition')
    def validate_condition(cls, v):
        allowed_conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']
        if v not in allowed_conditions:
            raise ValueError(f'Condition must be one of: {", ".join(allowed_conditions)}')
        return v


class MarketplaceItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    condition: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    specifications: Optional[List[Dict[str, str]]] = None
    status: Optional[str] = None


class SearchFilters(BaseModel):
    category: Optional[str] = None
    condition: Optional[List[str]] = None
    priceMin: Optional[float] = None
    priceMax: Optional[float] = None
    university: Optional[str] = None
    tags: Optional[List[str]] = None
    sortBy: Optional[str] = None


class SellerInfo(BaseModel):
    id: str
    name: str
    username: str
    university: str
    rating: float = 0.0
    reviewCount: int = 0
    avatar: Optional[str] = None
    
    class Config:
        from_attributes = True


class MarketplaceItemResponse(MarketplaceItemBase):
    id: str
    sellerId: str
    seller: SellerInfo
    images: List[str] = []
    status: str
    views: int
    saves: int
    saved: bool = False
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True


class MarketplaceItemsResponse(PaginationResponse):
    items: List[MarketplaceItemResponse]


class CreateItemResponse(BaseModel):
    item: MarketplaceItemResponse


class SaveItemResponse(BaseModel):
    saved: bool
    savesCount: int