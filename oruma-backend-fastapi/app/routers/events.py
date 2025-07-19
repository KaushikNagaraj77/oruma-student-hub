from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user, validate_pagination_params
from app.models.user import User
from app.schemas.event import *
from app.schemas.common import CategoryResponse, CategoryItem
from app.services.file_service import FileService

router = APIRouter()


@router.get("/", response_model=EventsResponse)
async def get_events(
    pagination: tuple = Depends(validate_pagination_params),
    category: Optional[str] = None,
    university: Optional[str] = None,
    date: Optional[str] = None,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[str] = None,
    tags: Optional[str] = None,
    sortBy: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get events with filters and pagination"""
    cursor, limit = pagination
    
    return EventsResponse(
        events=[],
        hasMore=False,
        nextCursor=None,
        total=0
    )


@router.post("/", response_model=CreateEventResponse)
async def create_event(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    date: str = Form(...),  # ISO date string
    startTime: str = Form(...),
    endTime: str = Form(...),
    location: str = Form(...),
    capacity: int = Form(...),
    registrationRequired: bool = Form(True),
    tags: Optional[str] = Form(None),  # JSON string
    bannerImage: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new event"""
    
    # Handle banner image upload
    banner_url = None
    if bannerImage and bannerImage.filename:
        file_service = FileService()
        banner_url, _ = await file_service.save_image(bannerImage, "events")
    
    # Parse tags
    import json
    tags_list = json.loads(tags) if tags else None
    
    # Parse date
    event_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
    
    # Create event data
    event_data = EventCreate(
        title=title,
        description=description,
        category=category,
        date=event_date,
        startTime=startTime,
        endTime=endTime,
        location=location,
        capacity=capacity,
        registrationRequired=registrationRequired,
        tags=tags_list,
        bannerImage=banner_url
    )
    
    # Mock organizer info
    from app.schemas.common import UserBasic
    organizer = UserBasic(
        id=str(current_user.id),
        name=current_user.name,
        username=current_user.name.lower().replace(" ", "_"),
        university=current_user.university,
        avatar=current_user.avatar
    )
    
    # Mock response
    mock_event = EventResponse(
        id="mock-event-id",
        organizerId=str(current_user.id),
        organizer=organizer,
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        date=event_data.date,
        startTime=event_data.startTime,
        endTime=event_data.endTime,
        location=event_data.location,
        capacity=event_data.capacity,
        registrationRequired=event_data.registrationRequired,
        bannerImage=event_data.bannerImage,
        tags=event_data.tags,
        attendees=0,
        maxAttendees=event_data.capacity,
        isRegistered=False,
        status="upcoming",
        university=current_user.university,
        views=0,
        saves=0,
        saved=False,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )
    
    return CreateEventResponse(event=mock_event)


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific event by ID"""
    from app.utils.exceptions import OrumaNotFoundException
    raise OrumaNotFoundException("Event not found", "Event")


@router.post("/{event_id}/register", response_model=RegisterEventResponse)
async def register_for_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register for an event"""
    return RegisterEventResponse(registered=True, attendeesCount=1)


@router.post("/{event_id}/unregister", response_model=RegisterEventResponse)
async def unregister_from_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unregister from an event"""
    return RegisterEventResponse(registered=False, attendeesCount=0)


@router.post("/{event_id}/save", response_model=SaveEventResponse)
async def save_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or unsave an event"""
    return SaveEventResponse(saved=True, savesCount=1)


@router.get("/search", response_model=EventsResponse)
async def search_events(
    q: str,
    pagination: tuple = Depends(validate_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search events"""
    cursor, limit = pagination
    
    return EventsResponse(
        events=[],
        hasMore=False,
        nextCursor=None,
        total=0
    )


@router.get("/categories", response_model=CategoryResponse)
async def get_categories(
    db: Session = Depends(get_db)
):
    """Get event categories"""
    from app.schemas.common import CategoryResponse, CategoryItem
    
    # Mock categories
    categories = [
        CategoryItem(id="academic", name="Academic", count=10),
        CategoryItem(id="social", name="Social", count=25),
        CategoryItem(id="sports", name="Sports", count=15),
        CategoryItem(id="career", name="Career", count=8),
        CategoryItem(id="cultural", name="Cultural", count=12)
    ]
    
    return CategoryResponse(categories=categories)


@router.post("/{event_id}/view")
async def mark_as_viewed(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark event as viewed (for analytics)"""
    return {"message": "Event marked as viewed"}