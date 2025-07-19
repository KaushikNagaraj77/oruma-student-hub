from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from app.schemas.common import PaginationResponse


class MessageBase(BaseModel):
    content: str


class MessageCreate(BaseModel):
    conversationId: str
    content: str
    receiverId: str
    
    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('Content cannot be empty')
        if len(v.strip()) > 1000:
            raise ValueError('Content must be less than 1000 characters')
        return v.strip()


class MessageResponse(BaseModel):
    id: str
    senderId: str
    receiverId: str
    content: str
    timestamp: datetime
    status: str  # sent, delivered, read
    conversationId: str
    failed: Optional[bool] = False
    
    class Config:
        from_attributes = True


class MessagesResponse(PaginationResponse):
    messages: List[MessageResponse]


class SendMessageResponse(BaseModel):
    message: MessageResponse


class CreateConversationRequest(BaseModel):
    participantId: str


class ConversationResponse(BaseModel):
    id: str
    participants: List[str]
    lastMessage: Optional[MessageResponse] = None
    unreadCount: int = 0
    updatedAt: datetime
    
    class Config:
        from_attributes = True


class ConversationsResponse(PaginationResponse):
    conversations: List[ConversationResponse]


class UserSearchResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    
    class Config:
        from_attributes = True