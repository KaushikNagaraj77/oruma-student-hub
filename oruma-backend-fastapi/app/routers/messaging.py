from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user, validate_pagination_params
from app.models.user import User
from app.schemas.message import *

router = APIRouter()


@router.get("/conversations", response_model=ConversationsResponse)
async def get_conversations(
    pagination: tuple = Depends(validate_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's conversations"""
    cursor, limit = pagination
    
    return ConversationsResponse(
        conversations=[],
        hasMore=False,
        nextCursor=None
    )


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation_data: CreateConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new conversation"""
    
    # Mock response
    mock_conversation = ConversationResponse(
        id="mock-conversation-id",
        participants=[str(current_user.id), conversation_data.participantId],
        lastMessage=None,
        unreadCount=0,
        updatedAt=datetime.now()
    )
    
    return mock_conversation


@router.get("/conversations/{conversation_id}/messages", response_model=MessagesResponse)
async def get_messages(
    conversation_id: str,
    pagination: tuple = Depends(validate_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get messages in a conversation"""
    cursor, limit = pagination
    
    return MessagesResponse(
        messages=[],
        hasMore=False,
        nextCursor=None
    )


@router.post("/messages", response_model=SendMessageResponse)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message"""
    
    # Mock response
    mock_message = MessageResponse(
        id="mock-message-id",
        senderId=str(current_user.id),
        receiverId=message_data.receiverId,
        content=message_data.content,
        timestamp=datetime.now(),
        status="sent",
        conversationId=message_data.conversationId,
        failed=False
    )
    
    return SendMessageResponse(message=mock_message)


@router.put("/messages/{message_id}/read")
async def mark_message_as_read(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark message as read"""
    return {"message": "Message marked as read"}


@router.put("/conversations/{conversation_id}/read")
async def mark_conversation_as_read(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all messages in conversation as read"""
    return {"message": "Conversation marked as read"}


@router.get("/users/search")
async def search_users(
    q: str,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search users for messaging"""
    
    # Mock empty response for now
    return []


@router.get("/users/{user_id}", response_model=UserSearchResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user information"""
    from app.utils.exceptions import OrumaNotFoundException
    raise OrumaNotFoundException("User not found", "User")