from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from app.schemas.common import PaginationResponse, UserBasic


class PostBase(BaseModel):
    content: str
    type: Optional[str] = "general"
    location: Optional[str] = None
    hashtags: Optional[List[str]] = None
    mentions: Optional[List[str]] = None


class PostCreate(PostBase):
    images: Optional[List[str]] = None
    
    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('Content cannot be empty')
        if len(v.strip()) > 2000:
            raise ValueError('Content must be less than 2000 characters')
        return v.strip()
    
    @validator('hashtags')
    def validate_hashtags(cls, v):
        if v is not None:
            if len(v) > 10:
                raise ValueError('Maximum 10 hashtags allowed')
            for hashtag in v:
                if len(hashtag) > 50:
                    raise ValueError('Hashtag too long (max 50 characters)')
        return v
    
    @validator('mentions')
    def validate_mentions(cls, v):
        if v is not None:
            if len(v) > 10:
                raise ValueError('Maximum 10 mentions allowed')
            for mention in v:
                if len(mention) > 50:
                    raise ValueError('Mention too long (max 50 characters)')
        return v


class PostUpdate(BaseModel):
    content: Optional[str] = None
    location: Optional[str] = None
    hashtags: Optional[List[str]] = None
    mentions: Optional[List[str]] = None
    
    @validator('content')
    def validate_content(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Content cannot be empty')
            if len(v.strip()) > 2000:
                raise ValueError('Content must be less than 2000 characters')
            return v.strip()
        return v


class PostResponse(PostBase):
    id: str
    authorId: str
    author: str
    username: str
    university: str
    time: str
    likes: int
    comments: int
    saves: int
    images: Optional[List[str]] = None
    liked: bool = False
    saved: bool = False
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True


class PostsResponse(PaginationResponse):
    posts: List[PostResponse]


class CreatePostResponse(BaseModel):
    post: PostResponse
    

class SaveResponse(BaseModel):
    """Response for save/unsave operations"""
    saved: bool
    savesCount: Optional[int] = None

class UploadImageResponse(BaseModel):
    """Response for image upload"""
    url: str
    id: str


class CommentBase(BaseModel):
    content: str
    parentId: Optional[str] = None


class CommentCreate(CommentBase):
    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('Content cannot be empty')
        if len(v.strip()) > 1000:
            raise ValueError('Content must be less than 1000 characters')
        return v.strip()


class CommentResponse(CommentBase):
    id: str
    postId: str
    authorId: str
    author: str
    username: str
    likes: int
    liked: bool = False
    createdAt: datetime
    updatedAt: datetime
    replies: Optional[List['CommentResponse']] = None
    
    class Config:
        from_attributes = True


class CommentsResponse(PaginationResponse):
    comments: List[CommentResponse]


class CreateCommentResponse(BaseModel):
    comment: CommentResponse


# Allow forward references
CommentResponse.model_rebuild()