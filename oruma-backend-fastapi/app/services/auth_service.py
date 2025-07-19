from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import Optional

from app.models.user import User, RefreshToken
from app.schemas.user import UserCreate, LoginRequest
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.utils.exceptions import OrumaBadRequestException, OrumaUnauthorizedException, OrumaConflictException
from app.utils.validators import validate_email_format, validate_password_strength, validate_university_name
from app.config import settings


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register_user(self, user_data: UserCreate) -> tuple[User, str, str]:
        """Register a new user"""
        
        # Validate email format
        if not validate_email_format(user_data.email):
            raise OrumaBadRequestException("Invalid email format")
        
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise OrumaConflictException("User with this email already exists")
        
        # Validate password strength
        is_valid, errors = validate_password_strength(user_data.password)
        if not is_valid:
            raise OrumaBadRequestException("Password validation failed", {"errors": errors})
        
        # Validate university
        if not validate_university_name(user_data.university):
            raise OrumaBadRequestException("Invalid university name")
        
        # Create new user
        db_user = User(
            name=user_data.name,
            email=user_data.email.lower(),
            password_hash=hash_password(user_data.password),
            university=user_data.university
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        # Generate tokens
        access_token = create_access_token(data={"sub": str(db_user.id)})
        refresh_token = create_refresh_token(data={"sub": str(db_user.id)})
        
        # Store refresh token
        self._store_refresh_token(db_user.id, refresh_token)
        
        return db_user, access_token, refresh_token

    def login_user(self, login_data: LoginRequest) -> tuple[User, str, str]:
        """Login user and return tokens"""
        
        # Find user by email
        user = self.db.query(User).filter(User.email == login_data.email.lower()).first()
        if not user:
            raise OrumaUnauthorizedException("Invalid email or password")
        
        # Verify password
        if not verify_password(login_data.password, user.password_hash):
            raise OrumaUnauthorizedException("Invalid email or password")
        
        # Generate tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Store refresh token
        self._store_refresh_token(user.id, refresh_token)
        
        return user, access_token, refresh_token

    def refresh_access_token(self, refresh_token: str) -> tuple[str, str]:
        """Refresh access token using refresh token"""
        
        # Decode refresh token
        payload = decode_token(refresh_token)
        if not payload:
            raise OrumaUnauthorizedException("Invalid refresh token")
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            raise OrumaUnauthorizedException("Invalid token type")
        
        user_id = payload.get("sub")
        if not user_id:
            raise OrumaUnauthorizedException("Invalid refresh token")
        
        # Check if refresh token exists and is active
        stored_token = self.db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token,
            RefreshToken.user_id == user_id,
            RefreshToken.is_active == "true",
            RefreshToken.expires_at > datetime.utcnow()
        ).first()
        
        if not stored_token:
            raise OrumaUnauthorizedException("Invalid or expired refresh token")
        
        # Check if user still exists
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise OrumaUnauthorizedException("User not found")
        
        # Generate new tokens
        new_access_token = create_access_token(data={"sub": str(user.id)})
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Invalidate old refresh token
        stored_token.is_active = "false"
        
        # Store new refresh token
        self._store_refresh_token(user.id, new_refresh_token)
        
        self.db.commit()
        
        return new_access_token, new_refresh_token

    def logout_user(self, refresh_token: Optional[str] = None) -> None:
        """Logout user by invalidating refresh token"""
        
        if refresh_token:
            # Invalidate the specific refresh token
            stored_token = self.db.query(RefreshToken).filter(
                RefreshToken.token == refresh_token,
                RefreshToken.is_active == "true"
            ).first()
            
            if stored_token:
                stored_token.is_active = "false"
                self.db.commit()

    def _store_refresh_token(self, user_id: str, token: str) -> None:
        """Store refresh token in database"""
        
        expires_at = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        
        refresh_token_record = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        
        self.db.add(refresh_token_record)
        self.db.commit()

    def cleanup_expired_tokens(self) -> None:
        """Cleanup expired refresh tokens"""
        
        self.db.query(RefreshToken).filter(
            RefreshToken.expires_at < datetime.utcnow()
        ).delete()
        
        self.db.commit()