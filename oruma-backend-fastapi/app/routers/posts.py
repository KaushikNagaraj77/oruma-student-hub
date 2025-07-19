from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.dependencies import get_current_user, validate_pagination_params
from app.models.user import User
from app.schemas.post import *
from app.schemas.common import LikeResponse
from app.services.file_service import FileService
from app.utils.exceptions import *

router = APIRouter()


@router.get("/", response_model=PostsResponse)
async def get_posts(
    pagination: tuple = Depends(validate_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get posts feed with pagination"""
    cursor, limit = pagination
    
    # This would be implemented with proper service layer
    # For now, return mock response matching frontend expectations
    return PostsResponse(
        posts=[],
        hasMore=False,
        nextCursor=None
    )


@router.post("/", response_model=CreatePostResponse)
async def create_post(
    content: str = Form(...),
    type: Optional[str] = Form("general"),
    location: Optional[str] = Form(None),
    hashtags: Optional[str] = Form(None),  # JSON string
    mentions: Optional[str] = Form(None),   # JSON string
    images: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post with optional images"""
    
    # Handle file uploads
    image_urls = []
    if images and images[0].filename:  # Check if files were uploaded
        file_service = FileService()
        
        if len(images) > 5:
            raise OrumaValidationException("Maximum 5 images allowed")
        
        for image in images:
            if image.filename:  # Skip empty uploads
                url, _ = await file_service.save_image(image, "posts")
                image_urls.append(url)
    
    # Parse hashtags and mentions
    import json
    hashtags_list = json.loads(hashtags) if hashtags else None
    mentions_list = json.loads(mentions) if mentions else None
    
    # Create post data
    post_data = PostCreate(
        content=content,
        type=type,
        location=location,
        hashtags=hashtags_list,
        mentions=mentions_list,
        images=image_urls if image_urls else None
    )
    
    # Mock response for now - implement service layer
    mock_post = PostResponse(
        id="mock-id",
        authorId=str(current_user.id),
        author=current_user.name,
        username=current_user.name.lower().replace(" ", "_"),
        university=current_user.university,
        time=datetime.now().isoformat(),
        content=post_data.content,
        type=post_data.type,
        location=post_data.location,
        likes=0,
        comments=0,
        saves=0,
        images=post_data.images,
        liked=False,
        saved=False,
        hashtags=post_data.hashtags,
        mentions=post_data.mentions,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )
    
    return CreatePostResponse(post=mock_post)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific post by ID"""
    # Implement service layer logic here
    raise OrumaNotFoundException("Post not found", "Post")


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update post (only by author)"""
    # Implement service layer logic here
    raise OrumaNotFoundException("Post not found", "Post")


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete post (only by author)"""
    # Implement service layer logic here
    return {"message": "Post deleted successfully"}


@router.post("/{post_id}/like", response_model=LikeResponse)
async def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like or unlike a post"""
    # Implement service layer logic here
    return LikeResponse(liked=True, likesCount=1)


@router.post("/{post_id}/save", response_model=dict)
async def save_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or unsave a post"""
    # Implement service layer logic here
    return {"saved": True}


@router.get("/{post_id}/comments", response_model=CommentsResponse)
async def get_comments(
    post_id: str,
    pagination: tuple = Depends(validate_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comments for a post"""
    cursor, limit = pagination
    
    return CommentsResponse(
        comments=[],
        hasMore=False,
        nextCursor=None
    )


@router.post("/{post_id}/comments", response_model=CreateCommentResponse)
async def create_comment(
    post_id: str,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment on a post"""
    
    # Mock response
    mock_comment = CommentResponse(
        id="mock-comment-id",
        postId=post_id,
        authorId=str(current_user.id),
        author=current_user.name,
        username=current_user.name.lower().replace(" ", "_"),
        content=comment_data.content,
        parentId=comment_data.parentId,
        likes=0,
        liked=False,
        createdAt=datetime.now(),
        updatedAt=datetime.now(),
        replies=[]
    )
    
    return CreateCommentResponse(comment=mock_comment)


@router.get("/search", response_model=PostsResponse)
async def search_posts(
    q: str,
    pagination: tuple = Depends(validate_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search posts"""
    cursor, limit = pagination
    
    return PostsResponse(
        posts=[],
        hasMore=False,
        nextCursor=None
    )


@router.get("/hashtag/{hashtag}", response_model=PostsResponse)
async def get_hashtag_posts(
    hashtag: str,
    pagination: tuple = Depends(validate_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get posts by hashtag"""
    cursor, limit = pagination
    
    return PostsResponse(
        posts=[],
        hasMore=False,
        nextCursor=None
    )