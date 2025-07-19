from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from app.schemas.common import PaginationResponse, UserBasic


class EventBase(BaseModel):
    title: str
    description: str
    category: str
    date: datetime
    startTime: str  # HH:MM format
    endTime: str    # HH:MM format
    location: str
    capacity: int
    registrationRequired: bool = True
    tags: Optional[List[str]] = None


class EventCreate(EventBase):
    bannerImage: Optional[str] = None
    
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
    
    @validator('capacity')
    def validate_capacity(cls, v):
        if v <= 0:
            raise ValueError('Capacity must be positive')
        if v > 10000:
            raise ValueError('Capacity cannot exceed 10,000')
        return v
    
    @validator('startTime', 'endTime')
    def validate_time_format(cls, v):
        import re
        if not re.match(r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$', v):
            raise ValueError('Time must be in HH:MM format')
        return v


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[datetime] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    registrationRequired: Optional[bool] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None


class EventFilters(BaseModel):
    category: Optional[str] = None
    university: Optional[str] = None
    date: Optional[str] = None  # ISO date string
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    sortBy: Optional[str] = None


class EventResponse(EventBase):
    id: str
    organizerId: str
    organizer: UserBasic
    attendees: int
    maxAttendees: int
    isRegistered: bool = False
    status: str
    university: str
    views: int
    saves: int
    saved: bool = False
    createdAt: datetime
    updatedAt: datetime
    bannerImage: Optional[str] = None
    
    class Config:
        from_attributes = True


class EventsResponse(PaginationResponse):
    events: List[EventResponse]


class CreateEventResponse(BaseModel):
    event: EventResponse


class EventRegistrationResponse(BaseModel):
    id: str
    eventId: str
    userId: str
    registeredAt: datetime
    status: str
    
    class Config:
        from_attributes = True


class RegisterEventResponse(BaseModel):
    registered: bool
    attendeesCount: int


class SaveEventResponse(BaseModel):
    saved: bool
    savesCount: int
