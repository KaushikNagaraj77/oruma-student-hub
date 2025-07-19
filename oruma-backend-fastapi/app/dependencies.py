from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.utils.security import decode_token
from app.utils.exceptions import OrumaUnauthorizedException

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user"""
    
    # Decode the token
    payload = decode_token(credentials.credentials)
    if payload is None:
        raise OrumaUnauthorizedException("Invalid authentication token")
    
    # Get user ID from payload
    user_id: str = payload.get("sub")
    if user_id is None:
        raise OrumaUnauthorizedException("Invalid authentication token")
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise OrumaUnauthorizedException("User not found")
    
    return user


async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get the current user if authenticated, otherwise return None"""
    
    if not authorization:
        return None
    
    if not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    
    # Decode the token
    payload = decode_token(token)
    if payload is None:
        return None
    
    # Get user ID from payload
    user_id: str = payload.get("sub")
    if user_id is None:
        return None
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    return user


def get_websocket_user(token: str, db: Session) -> Optional[User]:
    """Get user for WebSocket authentication"""
    
    # Decode the token
    payload = decode_token(token)
    if payload is None:
        return None
    
    # Get user ID from payload
    user_id: str = payload.get("sub")
    if user_id is None:
        return None
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    return user


async def validate_pagination_params(
    cursor: Optional[str] = None,
    limit: int = 10
) -> tuple[Optional[str], int]:
    """Validate and normalize pagination parameters"""
    
    # Limit bounds
    if limit < 1:
        limit = 1
    elif limit > 50:
        limit = 50
    
    return cursor, limit