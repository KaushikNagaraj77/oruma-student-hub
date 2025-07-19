from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user, validate_pagination_params
from app.models.user import User
from app.schemas.marketplace import *
from app.schemas.common import CategoryResponse, CategoryItem
from app.services.file_service import FileService

router = APIRouter()


@router.get("/items", response_model=MarketplaceItemsResponse)
async def get_items(
    pagination: tuple = Depends(validate_pagination_params),
    category: Optional[str] = None,
    condition: Optional[str] = None,
    priceMin: Optional[float] = None,
    priceMax: Optional[float] = None,
    university: Optional[str] = None,
    tags: Optional[str] = None,
    sortBy: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get marketplace items with filters and pagination"""
    cursor, limit = pagination
    
    return MarketplaceItemsResponse(
        items=[],
        hasMore=False,
        nextCursor=None,
        total=0
    )


@router.post("/items", response_model=CreateItemResponse)
async def create_item(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    condition: str = Form(...),
    category: str = Form(...),
    location: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # JSON string
    specifications: Optional[str] = Form(None),  # JSON string
    images: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new marketplace item"""
    
    # Handle image uploads
    image_urls = []
    if images and images[0].filename:  # Check if files were uploaded
        file_service = FileService()
        
        if len(images) > 8:
            from app.utils.exceptions import OrumaValidationException
            raise OrumaValidationException("Maximum 8 images allowed")
        
        for image in images:
            if image.filename:  # Skip empty uploads
                url, _ = await file_service.save_image(image, "marketplace")
                image_urls.append(url)
    
    # Parse tags and specifications
    import json
    tags_list = json.loads(tags) if tags else None
    specs_list = json.loads(specifications) if specifications else None
    
    # Create item data
    item_data = MarketplaceItemCreate(
        title=title,
        description=description,
        price=price,
        condition=condition,
        category=category,
        location=location,
        tags=tags_list,
        specifications=specs_list,
        images=image_urls if image_urls else None
    )
    
    # Mock seller info
    seller = SellerInfo(
        id=str(current_user.id),
        name=current_user.name,
        username=current_user.name.lower().replace(" ", "_"),
        university=current_user.university,
        rating=0.0,
        reviewCount=0,
        avatar=current_user.avatar
    )
    
    # Mock response
    mock_item = MarketplaceItemResponse(
        id="mock-item-id",
        sellerId=str(current_user.id),
        seller=seller,
        title=item_data.title,
        description=item_data.description,
        price=item_data.price,
        condition=item_data.condition,
        category=item_data.category,
        images=item_data.images or [],
        specifications=item_data.specifications,
        location=item_data.location,
        tags=item_data.tags,
        status="available",
        views=0,
        saves=0,
        saved=False,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )
    
    return CreateItemResponse(item=mock_item)


@router.get("/items/{item_id}", response_model=MarketplaceItemResponse)
async def get_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific item by ID"""
    from app.utils.exceptions import OrumaNotFoundException
    raise OrumaNotFoundException("Item not found", "MarketplaceItem")


@router.post("/items/{item_id}/save", response_model=SaveItemResponse)
async def save_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or unsave an item"""
    return SaveItemResponse(saved=True, savesCount=1)


@router.get("/items/search", response_model=MarketplaceItemsResponse)
async def search_items(
    q: str,
    pagination: tuple = Depends(validate_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search marketplace items"""
    cursor, limit = pagination
    
    return MarketplaceItemsResponse(
        items=[],
        hasMore=False,
        nextCursor=None,
        total=0
    )


@router.get("/categories", response_model=CategoryResponse)
async def get_categories(
    db: Session = Depends(get_db)
):
    """Get marketplace categories"""
    from app.schemas.common import CategoryResponse, CategoryItem
    
    # Mock categories
    categories = [
        CategoryItem(id="electronics", name="Electronics", count=45),
        CategoryItem(id="textbooks", name="Textbooks", count=32),
        CategoryItem(id="furniture", name="Furniture", count=18),
        CategoryItem(id="clothing", name="Clothing", count=25),
        CategoryItem(id="vehicles", name="Vehicles", count=8),
        CategoryItem(id="other", name="Other", count=12)
    ]
    
    return CategoryResponse(categories=categories)


@router.get("/items/{item_id}/similar")
async def get_similar_items(
    item_id: str,
    limit: int = 6,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get similar items"""
    return {"items": []}


@router.post("/items/{item_id}/view")
async def mark_as_viewed(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark item as viewed (for analytics)"""
    return {"message": "Item marked as viewed"}