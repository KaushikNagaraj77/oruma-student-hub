from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import (
    LoginRequest, LoginResponse, 
    RegisterRequest, RegisterResponse,
    RefreshTokenRequest, RefreshTokenResponse,
    UserPublic
)
from app.dependencies import get_current_user
from app.models.user import User
from app.utils.exceptions import OrumaBadRequestException, OrumaUnauthorizedException

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """User login endpoint"""
    auth_service = AuthService(db)
    
    try:
        user, access_token, refresh_token = auth_service.login_user(login_data)
        
        return LoginResponse(
            token=access_token,
            refreshToken=refresh_token,
            user=UserPublic(
                id=str(user.id),
                name=user.name,
                email=user.email,
                university=user.university,
                avatar=user.avatar
            )
        )
    except (OrumaBadRequestException, OrumaUnauthorizedException) as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/register", response_model=RegisterResponse)
async def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """User registration endpoint"""
    auth_service = AuthService(db)
    
    try:
        user, access_token, refresh_token = auth_service.register_user(user_data)
        
        return RegisterResponse(
            token=access_token,
            refreshToken=refresh_token,
            user=UserPublic(
                id=str(user.id),
                name=user.name,
                email=user.email,
                university=user.university,
                avatar=user.avatar
            )
        )
    except (OrumaBadRequestException, OrumaUnauthorizedException) as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/me", response_model=UserPublic)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return UserPublic(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        university=current_user.university,
        avatar=current_user.avatar
    )


@router.post("/logout")
async def logout(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """User logout endpoint"""
    auth_service = AuthService(db)
    auth_service.logout_user(refresh_data.refreshToken)
    
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token endpoint"""
    auth_service = AuthService(db)
    
    try:
        new_access_token, new_refresh_token = auth_service.refresh_access_token(refresh_data.refreshToken)
        
        return RefreshTokenResponse(
            token=new_access_token,
            refreshToken=new_refresh_token
        )
    except OrumaUnauthorizedException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")