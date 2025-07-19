# Oruma Student Hub - Complete Backend API Specification

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [File Handling](#file-handling)
8. [WebSocket Events](#websocket-events)
9. [Environment Variables](#environment-variables)
10. [Database Schema](#database-schema)
11. [Business Logic Requirements](#business-logic-requirements)
12. [Security Considerations](#security-considerations)

---

## Overview

The Oruma Student Hub backend needs to support a comprehensive social platform for university students with features including:
- User authentication and authorization
- Social feed with posts and comments
- Event management and registration
- Marketplace for buying/selling items
- Real-time messaging system
- University search and management
- File uploads (images for posts, events, marketplace items)

**Base URL Pattern**: `http://localhost:3333` (development) / `https://api.oruma.com` (production)

---

## Technology Stack

Based on frontend analysis, the backend should be built with:
- **Framework**: FastAPI (Python) - Recommended for high performance async API
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with refresh tokens
- **File Storage**: AWS S3 or local file system with proper URL handling
- **WebSocket**: FastAPI's WebSocket support for real-time features
- **Cache**: Redis (optional for performance optimization)

---

## Authentication & Authorization

### Authentication Flow
- JWT-based authentication with access tokens (24-hour expiry) and refresh tokens
- Tokens stored in localStorage on frontend
- Bearer token format: `Authorization: Bearer <token>`

### Token Management
```python
# Token payload structure
{
  "userId": "string",
  "email": "string", 
  "university": "string",
  "exp": timestamp,
  "iat": timestamp
}
```

### Protected Route Requirements
- Most endpoints require authentication except:
  - `/api/auth/login`
  - `/api/auth/register`
  - `/api/universities/search` (public university search)

---

## API Endpoints

### 1. Authentication Endpoints (`/api/auth`)

#### POST `/api/auth/login`
**Purpose**: User login
**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response** (200):
```json
{
  "token": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "university": "string",
    "avatar": "string (optional)"
  }
}
```
**Errors**: 400 (Invalid credentials), 401 (Invalid email/password)

#### POST `/api/auth/register`
**Purpose**: User registration
**Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "university": "string"
}
```
**Response** (201): Same as login
**Errors**: 400 (User exists, validation errors), 422 (Invalid data)

#### GET `/api/auth/me`
**Purpose**: Get current user info
**Headers**: `Authorization: Bearer <token>`
**Response** (200):
```json
{
  "id": "string",
  "name": "string", 
  "email": "string",
  "university": "string",
  "avatar": "string (optional)"
}
```

#### POST `/api/auth/logout`
**Purpose**: Logout user (invalidate tokens)
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "refreshToken": "string"
}
```
**Response** (200): `{}`

#### POST `/api/auth/refresh`
**Purpose**: Refresh access token
**Request Body**:
```json
{
  "refreshToken": "string"
}
```
**Response** (200):
```json
{
  "token": "string",
  "refreshToken": "string"
}
```

### 2. Posts Endpoints (`/api/posts`)

#### GET `/api/posts`
**Purpose**: Get paginated posts feed
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `cursor`: string (optional) - Pagination cursor
- `limit`: integer (default: 10, max: 50) - Items per page

**Response** (200):
```json
{
  "posts": [
    {
      "id": "string",
      "authorId": "string",
      "author": "string",
      "username": "string",
      "university": "string",
      "time": "string (ISO)",
      "location": "string (optional)",
      "content": "string",
      "likes": "number",
      "comments": "number", 
      "saves": "number",
      "images": ["string"] (optional),
      "liked": "boolean",
      "saved": "boolean",
      "type": "study|food|achievement|event|general",
      "hashtags": ["string"] (optional),
      "mentions": ["string"] (optional),
      "createdAt": "string (ISO)",
      "updatedAt": "string (ISO)"
    }
  ],
  "hasMore": "boolean",
  "nextCursor": "string (optional)"
}
```

#### POST `/api/posts`
**Purpose**: Create new post
**Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data` (if images)
**Request Body** (with images):
```
content: string
type: string (optional)
location: string (optional) 
hashtags: string (JSON array, optional)
mentions: string (JSON array, optional)
images: File[] (optional, max 5 files)
```

**Request Body** (JSON only):
```json
{
  "content": "string",
  "type": "string (optional)",
  "location": "string (optional)",
  "hashtags": ["string"] (optional),
  "mentions": ["string"] (optional)
}
```

**Response** (201):
```json
{
  "post": {
    // Same structure as post object above
  }
}
```

#### GET `/api/posts/{postId}`
**Purpose**: Get specific post
**Response** (200): Single post object

#### PUT `/api/posts/{postId}`
**Purpose**: Update post (only by author)
**Request Body**: Same as create post
**Response** (200): Updated post object

#### DELETE `/api/posts/{postId}`  
**Purpose**: Delete post (only by author)
**Response** (204): No content

#### POST `/api/posts/{postId}/like`
**Purpose**: Like/unlike post
**Response** (200):
```json
{
  "liked": "boolean",
  "likesCount": "number"
}
```

#### POST `/api/posts/{postId}/save`
**Purpose**: Save/unsave post
**Response** (200):
```json
{
  "saved": "boolean"
}
```

#### GET `/api/posts/{postId}/comments`
**Purpose**: Get post comments
**Query Parameters**: `cursor`, `limit`
**Response** (200):
```json
{
  "comments": [
    {
      "id": "string",
      "postId": "string", 
      "authorId": "string",
      "author": "string",
      "username": "string",
      "content": "string",
      "likes": "number",
      "liked": "boolean",
      "createdAt": "string (ISO)",
      "updatedAt": "string (ISO)",
      "replies": [
        // Nested comment objects (optional)
      ]
    }
  ],
  "hasMore": "boolean",
  "nextCursor": "string (optional)"
}
```

#### POST `/api/posts/{postId}/comments`
**Purpose**: Create comment on post
**Request Body**:
```json
{
  "content": "string",
  "parentId": "string (optional)" // For reply to comment
}
```
**Response** (201):
```json
{
  "comment": {
    // Comment object
  }
}
```

#### POST `/api/comments/{commentId}/like`
**Purpose**: Like/unlike comment
**Response** (200): Same as post like

#### DELETE `/api/comments/{commentId}`
**Purpose**: Delete comment
**Response** (204): No content

#### GET `/api/posts/search`
**Purpose**: Search posts
**Query Parameters**: `q` (query), `cursor`, `limit`
**Response** (200): Same as get posts

#### GET `/api/posts/hashtag/{hashtag}`
**Purpose**: Get posts by hashtag
**Response** (200): Same as get posts

#### GET `/api/users/{userId}/posts`
**Purpose**: Get user's posts
**Response** (200): Same as get posts

#### POST `/api/upload/image`
**Purpose**: Upload image for posts
**Headers**: `Content-Type: multipart/form-data`
**Request Body**: `image: File`
**Response** (200):
```json
{
  "url": "string",
  "id": "string"
}
```

### 3. Events Endpoints (`/api/events`)

#### GET `/api/events`
**Purpose**: Get paginated events
**Query Parameters**:
- `cursor`, `limit` - Pagination
- `category` - Filter by category  
- `university` - Filter by university
- `date` - Filter by specific date (ISO)
- `dateFrom`, `dateTo` - Date range filter
- `location` - Filter by location
- `status` - Filter by status (upcoming, ongoing, completed)
- `tags` - Filter by tags (multiple)
- `sortBy` - Sort order (date, popularity, recent, capacity)

**Response** (200):
```json
{
  "events": [
    {
      "id": "string",
      "organizerId": "string", 
      "title": "string",
      "description": "string",
      "category": "string",
      "date": "string (ISO)",
      "startTime": "string (HH:MM)",
      "endTime": "string (HH:MM)", 
      "location": "string",
      "capacity": "number",
      "registrationRequired": "boolean",
      "bannerImage": "string (optional)",
      "organizer": {
        "id": "string",
        "name": "string",
        "username": "string", 
        "university": "string",
        "avatar": "string (optional)"
      },
      "attendees": "number",
      "maxAttendees": "number",
      "isRegistered": "boolean",
      "status": "upcoming|ongoing|completed|cancelled",
      "tags": ["string"] (optional),
      "university": "string",
      "views": "number",
      "saves": "number", 
      "saved": "boolean",
      "createdAt": "string (ISO)",
      "updatedAt": "string (ISO)"
    }
  ],
  "hasMore": "boolean",
  "nextCursor": "string (optional)",
  "total": "number"
}
```

#### POST `/api/events`
**Purpose**: Create event
**Headers**: `Content-Type: multipart/form-data` (if banner image)
**Request Body**:
```
title: string
description: string  
category: string
date: string (ISO)
startTime: string (HH:MM)
endTime: string (HH:MM)
location: string
capacity: number
registrationRequired: boolean
tags: string (JSON array, optional)
bannerImage: File (optional)
```

**Response** (201):
```json
{
  "event": {
    // Event object
  }
}
```

#### GET `/api/events/{eventId}`
**Purpose**: Get event details
**Response** (200): Single event object

#### PUT `/api/events/{eventId}`
**Purpose**: Update event (organizer only)
**Response** (200): Updated event object

#### DELETE `/api/events/{eventId}`
**Purpose**: Delete event (organizer only)  
**Response** (204): No content

#### POST `/api/events/{eventId}/register`
**Purpose**: Register for event
**Response** (200):
```json
{
  "registered": "boolean",
  "attendeesCount": "number"
}
```

#### POST `/api/events/{eventId}/unregister`
**Purpose**: Unregister from event
**Response** (200): Same as register

#### POST `/api/events/{eventId}/save`
**Purpose**: Save event
**Response** (200):
```json
{
  "saved": "boolean",
  "savesCount": "number"
}
```

#### GET `/api/events/search`
**Purpose**: Search events
**Query Parameters**: `q`, `cursor`, `limit`, filters
**Response** (200): Same as get events

#### GET `/api/events/categories`
**Purpose**: Get event categories
**Response** (200):
```json
{
  "categories": [
    {
      "id": "string",
      "name": "string", 
      "count": "number"
    }
  ]
}
```

#### GET `/api/events/users/{userId}/events`
**Purpose**: Get user's organized events
**Response** (200): Same as get events

#### GET `/api/events/registered`
**Purpose**: Get current user's registered events  
**Response** (200): Same as get events

#### GET `/api/events/{eventId}/registrations`
**Purpose**: Get event registrations (organizer only)
**Response** (200):
```json
[
  {
    "id": "string",
    "eventId": "string",
    "userId": "string", 
    "registeredAt": "string (ISO)",
    "status": "registered|cancelled|attended"
  }
]
```

#### POST `/api/events/upload/image`
**Purpose**: Upload event banner
**Response** (200): Same as post image upload

#### POST `/api/events/{eventId}/view`
**Purpose**: Mark event as viewed (analytics)
**Response** (200): `{}`

#### POST `/api/events/{eventId}/report`
**Purpose**: Report inappropriate event
**Request Body**:
```json
{
  "reason": "string",
  "description": "string (optional)"
}
```
**Response** (200): `{}`

### 4. Marketplace Endpoints (`/api/marketplace`)

#### GET `/api/marketplace/items`  
**Purpose**: Get marketplace items
**Query Parameters**:
- `cursor`, `limit` - Pagination
- `category` - Filter by category
- `condition` - Filter by condition (multiple)
- `priceMin`, `priceMax` - Price range
- `university` - Filter by university
- `tags` - Filter by tags
- `sortBy` - Sort (recent, price_low, price_high, popular)

**Response** (200):
```json
{
  "items": [
    {
      "id": "string",
      "sellerId": "string",
      "title": "string",
      "description": "string", 
      "price": "number",
      "condition": "New|Like New|Good|Fair|Poor",
      "category": "string",
      "images": ["string"],
      "specifications": [
        {
          "label": "string",
          "value": "string"
        }
      ] (optional),
      "seller": {
        "id": "string",
        "name": "string",
        "username": "string",
        "university": "string", 
        "rating": "number",
        "reviewCount": "number",
        "avatar": "string (optional)"
      },
      "location": "string (optional)",
      "tags": ["string"] (optional),
      "status": "available|sold|reserved",
      "views": "number",
      "saves": "number",
      "saved": "boolean", 
      "createdAt": "string (ISO)",
      "updatedAt": "string (ISO)"
    }
  ],
  "hasMore": "boolean",
  "nextCursor": "string (optional)",
  "total": "number"
}
```

#### POST `/api/marketplace/items`
**Purpose**: Create marketplace item
**Headers**: `Content-Type: multipart/form-data` (if images)
**Request Body**:
```
title: string
description: string
price: number
condition: string 
category: string
location: string (optional)
tags: string (JSON array, optional)
specifications: string (JSON array, optional)
images: File[] (optional, max 8)
```

**Response** (201):
```json
{
  "item": {
    // Item object  
  }
}
```

#### GET `/api/marketplace/items/{itemId}`
**Purpose**: Get item details
**Response** (200): Single item object

#### PUT `/api/marketplace/items/{itemId}`
**Purpose**: Update item (seller only)
**Response** (200): Updated item object

#### DELETE `/api/marketplace/items/{itemId}`
**Purpose**: Delete item (seller only)
**Response** (204): No content

#### POST `/api/marketplace/items/{itemId}/save`  
**Purpose**: Save/unsave item
**Response** (200):
```json
{
  "saved": "boolean", 
  "savesCount": "number"
}
```

#### GET `/api/marketplace/items/search`
**Purpose**: Search items
**Query Parameters**: `q`, filters
**Response** (200): Same as get items

#### GET `/api/marketplace/categories`
**Purpose**: Get marketplace categories  
**Response** (200):
```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "count": "number"
    }
  ]
}
```

#### GET `/api/marketplace/users/{userId}/items`
**Purpose**: Get user's items
**Response** (200): Same as get items

#### GET `/api/marketplace/saved`
**Purpose**: Get user's saved items
**Response** (200): Same as get items

#### GET `/api/marketplace/items/{itemId}/similar`
**Purpose**: Get similar items
**Query Parameters**: `limit` (default: 6)
**Response** (200):
```json
{
  "items": [
    // Item objects
  ]
}
```

#### POST `/api/marketplace/upload/image`
**Purpose**: Upload item image
**Response** (200): Same as image upload

#### POST `/api/marketplace/items/{itemId}/report`
**Purpose**: Report inappropriate item
**Request Body**: Same as event report
**Response** (200): `{}`

#### POST `/api/marketplace/items/{itemId}/view`
**Purpose**: Mark item as viewed
**Response** (200): `{}`

### 5. Messaging Endpoints (`/api`)

#### GET `/api/conversations`
**Purpose**: Get user conversations
**Query Parameters**: `cursor`, `limit`
**Response** (200):
```json
{
  "conversations": [
    {
      "id": "string",
      "participants": ["string"],
      "lastMessage": {
        "id": "string",
        "senderId": "string", 
        "receiverId": "string",
        "content": "string",
        "timestamp": "string (ISO)",
        "status": "sent|delivered|read",
        "conversationId": "string",
        "failed": "boolean (optional)"
      } (optional),
      "unreadCount": "number",
      "updatedAt": "string (ISO)"
    }
  ],
  "hasMore": "boolean",
  "nextCursor": "string (optional)"
}
```

#### POST `/api/conversations`
**Purpose**: Create conversation
**Request Body**:
```json
{
  "participantId": "string"
}
```  
**Response** (201): Single conversation object

#### GET `/api/conversations/{conversationId}/messages`
**Purpose**: Get conversation messages
**Query Parameters**: `cursor`, `limit` (default: 50)
**Response** (200):
```json
{
  "messages": [
    {
      "id": "string",
      "senderId": "string",
      "receiverId": "string", 
      "content": "string",
      "timestamp": "string (ISO)",
      "status": "sent|delivered|read",
      "conversationId": "string",
      "failed": "boolean (optional)"
    }
  ],
  "hasMore": "boolean",
  "nextCursor": "string (optional)"
}
```

#### POST `/api/messages`
**Purpose**: Send message
**Request Body**:
```json
{
  "conversationId": "string",
  "content": "string",
  "receiverId": "string"
}
```
**Response** (201):
```json
{
  "message": {
    // Message object
  }
}
```

#### PUT `/api/messages/{messageId}/read`
**Purpose**: Mark message as read
**Response** (200): `{}`

#### PUT `/api/conversations/{conversationId}/read`
**Purpose**: Mark all messages in conversation as read
**Response** (200): `{}`

#### GET `/api/users/search`
**Purpose**: Search users for messaging
**Query Parameters**: `q`, `limit` (default: 10)
**Response** (200):
```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string (optional)"
  }
]
```

#### GET `/api/users/{userId}`
**Purpose**: Get user info
**Response** (200): User object

### 6. Universities Endpoints (`/api/universities`)

#### GET `/api/universities/search`
**Purpose**: Search universities (public endpoint)
**Query Parameters**: 
- `q` - Search query
- `limit` (default: 50)
- `cursor` - Pagination
- `state` - Filter by state
- `type` - Filter by type

**Response** (200):
```json
{
  "universities": [
    {
      "id": "string",
      "name": "string",
      "state": "string",
      "city": "string",
      "type": "public|private|community|technical|hbcu|tribal|religious|for-profit",
      "searchTerms": ["string"],
      "website": "string (optional)",
      "enrollment": "number (optional)",
      "established": "number (optional)",
      "accreditation": ["string"] (optional),
      "programs": ["string"] (optional),
      "latitude": "number (optional)",
      "longitude": "number (optional)"
    }
  ],
  "total": "number",
  "hasMore": "boolean", 
  "nextCursor": "string (optional)"
}
```

#### GET `/api/universities/{id}`
**Purpose**: Get university details
**Response** (200):
```json
{
  // University object plus:
  "description": "string (optional)",
  "campuses": [
    {
      "name": "string",
      "address": "string",
      "city": "string", 
      "state": "string"
    }
  ] (optional),
  "admissions": {
    "acceptanceRate": "number (optional)",
    "satScores": {
      "math": "number",
      "verbal": "number" 
    } (optional),
    "actScores": {
      "composite": "number"
    } (optional),
    "applicationDeadline": "string (optional)"
  } (optional),
  "tuition": {
    "inState": "number (optional)",
    "outOfState": "number (optional)", 
    "international": "number (optional)"
  } (optional),
  "demographics": {
    "totalStudents": "number",
    "undergraduateStudents": "number",
    "graduateStudents": "number", 
    "internationalStudents": "number (optional)"
  } (optional)
}
```

---

## Data Models

### Core Entity Models (Python/SQLAlchemy)

```python
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Float, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from datetime import datetime

Base = declarative_base()

# User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    university = Column(String(255), nullable=False)
    avatar = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    posts = relationship("Post", back_populates="user")
    events = relationship("Event", back_populates="organizer")
    marketplace_items = relationship("MarketplaceItem", back_populates="seller")

# Post model
class Post(Base):
    __tablename__ = "posts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String(50), default="general")
    location = Column(String(255), nullable=True)
    images = Column(ARRAY(String), nullable=True)
    hashtags = Column(ARRAY(String), nullable=True) 
    mentions = Column(ARRAY(String), nullable=True)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    saves_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")
    likes = relationship("PostLike", back_populates="post")
    saves = relationship("PostSave", back_populates="post")

# Event model  
class Event(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organizer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    date = Column(DateTime, nullable=False)
    start_time = Column(String(5), nullable=False)  # HH:MM
    end_time = Column(String(5), nullable=False)    # HH:MM
    location = Column(String(255), nullable=False)
    capacity = Column(Integer, nullable=False)
    registration_required = Column(Boolean, default=True)
    banner_image = Column(String(512), nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    university = Column(String(255), nullable=False) 
    status = Column(String(20), default="upcoming")
    views = Column(Integer, default=0)
    saves_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organizer = relationship("User", back_populates="events")
    registrations = relationship("EventRegistration", back_populates="event")
    saves = relationship("EventSave", back_populates="event")

# Marketplace Item model
class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    condition = Column(String(20), nullable=False)
    category = Column(String(100), nullable=False)
    images = Column(ARRAY(String), nullable=True)
    specifications = Column(Text, nullable=True)  # JSON string
    location = Column(String(255), nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    status = Column(String(20), default="available")
    views = Column(Integer, default=0)
    saves_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    seller = relationship("User", back_populates="marketplace_items")
    saves = relationship("MarketplaceItemSave", back_populates="item")

# Message model
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(20), default="sent")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

# Conversation model
class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participants = Column(ARRAY(String), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = relationship("Message", back_populates="conversation")

# Supporting models for many-to-many relationships
class PostLike(Base):
    __tablename__ = "post_likes"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    post = relationship("Post", back_populates="likes")

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="registered")
    registered_at = Column(DateTime, default=datetime.utcnow)
    
    event = relationship("Event", back_populates="registrations")
    user = relationship("User")

# Additional models for saves, comments, etc.
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": "string",
  "message": "string",
  "details": {
    // Additional error context (optional)
  }
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **422**: Unprocessable Entity (invalid data format)
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error

### Common Error Scenarios
1. **Authentication Errors**:
   - Invalid credentials → 401
   - Expired token → 401 
   - Missing token → 401

2. **Validation Errors**:
   - Invalid email format → 400
   - Required field missing → 400
   - Invalid data type → 422

3. **Permission Errors**:
   - Editing others' content → 403
   - Accessing private resources → 403

4. **Resource Errors**:
   - Post not found → 404
   - User not found → 404
   - Event capacity exceeded → 409

---

## File Handling

### Image Upload Requirements
- **Supported formats**: JPG, JPEG, PNG, WebP
- **Maximum file size**: 10MB per image
- **Maximum files per request**: 
  - Posts: 5 images
  - Events: 1 banner image
  - Marketplace: 8 images
- **Image processing**: Auto-resize for optimization
- **Storage**: AWS S3 or local storage with public URLs

### Upload Process
1. Client uploads image to specific endpoint
2. Server validates file type and size
3. Server processes/optimizes image
4. Server returns public URL and ID
5. Client includes URL in main entity creation request

### Image URL Structure
```
https://api.oruma.com/uploads/images/{type}/{id}.{ext}
# Examples:
# https://api.oruma.com/uploads/images/posts/uuid.jpg  
# https://api.oruma.com/uploads/images/events/uuid.jpg
# https://api.oruma.com/uploads/images/marketplace/uuid.jpg
```

---

## WebSocket Events

### Connection
- **URL**: `ws://localhost:3333/ws?token={jwt_token}`
- **Authentication**: JWT token in query parameter
- **Protocol**: JSON message format

### Event Types & Payloads

#### Client → Server Events

**Ping/Heartbeat**:
```json
{
  "type": "ping"
}
```

**User Typing**:
```json
{
  "type": "user_typing",
  "data": {
    "conversationId": "string",
    "isTyping": "boolean"
  }
}
```

**Message Read**:
```json
{
  "type": "message_read",
  "data": {
    "messageId": "string",
    "conversationId": "string"
  }
}
```

**Post Like**:
```json
{
  "type": "post_liked", // or "post_unliked"
  "data": {
    "postId": "string"
  }
}
```

#### Server → Client Events

**Message Received**:
```json
{
  "type": "message_received",
  "data": {
    "message": {
      // Complete message object
    }
  }
}
```

**Message Read**:
```json
{
  "type": "message_read", 
  "data": {
    "messageId": "string",
    "conversationId": "string",
    "readBy": "string"
  }
}
```

**User Typing**:
```json
{
  "type": "user_typing",
  "data": {
    "userId": "string",
    "conversationId": "string", 
    "isTyping": "boolean"
  }
}
```

**User Online Status**:
```json
{
  "type": "user_online", // or "user_offline"
  "data": {
    "userId": "string",
    "isOnline": "boolean",
    "lastSeen": "string (ISO, optional)"
  }
}
```

**Post Activity**:
```json
{
  "type": "post_liked", // post_unliked, post_commented, post_saved, etc.
  "data": {
    "postId": "string",
    "userId": "string",
    "likesCount": "number (optional)",
    "comment": {
      // Comment object (for post_commented)
    }
  }
}
```

**New Post**:
```json
{
  "type": "new_post",
  "data": {
    "post": {
      // Complete post object
    }
  }
}
```

### Connection Management
- **Heartbeat**: Client sends ping every 30 seconds
- **Reconnection**: Exponential backoff with max 5 attempts
- **Error Handling**: Connection errors should not crash client
- **Authentication**: Validate JWT on connection and disconnect invalid users

---

## Environment Variables

### Required Configuration
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/oruma_db
DATABASE_POOL_SIZE=20

# Authentication
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# API Configuration  
API_HOST=0.0.0.0
API_PORT=3333
API_DEBUG=false
CORS_ORIGINS=["http://localhost:5173", "https://oruma.com"]

# File Storage
UPLOAD_DIR=/app/uploads  # For local storage
AWS_ACCESS_KEY_ID=your-aws-key  # For S3
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=oruma-uploads
FILE_MAX_SIZE_MB=10

# External APIs
UNIVERSITIES_API_URL=http://universities.hipolabs.com
UNIVERSITIES_API_TIMEOUT=10

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=10

# Email (if implementing notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Environment-Specific Settings
- **Development**: Debug mode, local database, permissive CORS
- **Production**: Performance optimizations, restricted CORS, monitoring
- **Testing**: Isolated test database, mock external services

---

## Database Schema

### Key Tables Summary

1. **users**: User accounts and profiles
2. **posts**: Social media posts with content and metadata
3. **comments**: Comments on posts (with optional parent for replies)
4. **post_likes**: Many-to-many for post likes
5. **post_saves**: Many-to-many for saved posts
6. **events**: Event listings and details
7. **event_registrations**: Event registrations with status
8. **event_saves**: Saved events
9. **marketplace_items**: Items for sale/trade
10. **marketplace_item_saves**: Saved marketplace items  
11. **conversations**: Chat conversations between users
12. **messages**: Individual messages in conversations
13. **universities**: University directory (cached from external API)

### Indexes Required
```sql
-- Performance critical indexes
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_university_created ON posts(university, created_at DESC);
CREATE INDEX idx_events_date_university ON events(date, university);
CREATE INDEX idx_events_category_status ON events(category, status);
CREATE INDEX idx_marketplace_items_category_status ON marketplace_items(category, status);
CREATE INDEX idx_marketplace_items_price ON marketplace_items(price);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversations_participants ON conversations USING GIN(participants);

-- Search indexes (if using PostgreSQL full-text search)
CREATE INDEX idx_posts_content_search ON posts USING GIN(to_tsvector('english', content));
CREATE INDEX idx_events_title_search ON events USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_marketplace_title_search ON marketplace_items USING GIN(to_tsvector('english', title || ' ' || description));
```

### Data Relationships
- Users → Posts (one-to-many)
- Users → Events (one-to-many, as organizer)
- Users → Marketplace Items (one-to-many, as seller)
- Posts → Comments (one-to-many)
- Events → Registrations (one-to-many)
- Conversations → Messages (one-to-many)
- Users ↔ Posts (many-to-many, likes/saves)
- Users ↔ Events (many-to-many, registrations/saves)
- Users ↔ Marketplace Items (many-to-many, saves)

---

## Business Logic Requirements

### Authentication & Security
1. **Password Requirements**: Minimum 8 characters, at least one number
2. **Rate Limiting**: 
   - Login attempts: 5 per minute per IP
   - API requests: 60 per minute per user
   - File uploads: 10 per minute per user
3. **Token Security**:
   - Access tokens expire in 24 hours
   - Refresh tokens expire in 30 days
   - Tokens invalidated on logout
4. **Data Validation**:
   - Email format validation
   - University must exist in system
   - Content length limits (posts: 2000 chars)

### Content Management
1. **Post Rules**:
   - Maximum 5 images per post
   - Content cannot be empty
   - Hashtags: max 10 per post
   - Mentions: max 10 per post
2. **Event Rules**:
   - End time must be after start time
   - Date cannot be in the past
   - Capacity must be positive
   - Only organizer can edit/delete
3. **Marketplace Rules**:
   - Price must be positive
   - Maximum 8 images per item
   - Only seller can edit/delete
   - Status transitions: available → reserved → sold

### Messaging System
1. **Conversation Rules**:
   - Cannot message yourself
   - Conversations auto-created when needed
   - Maximum 2 participants per conversation
2. **Message Rules**:
   - Content cannot be empty
   - Messages cannot be edited
   - Read receipts are automatic
   - Typing indicators expire after 3 seconds

### Permissions & Access Control
1. **Post Access**:
   - All users can view public posts
   - Only author can edit/delete posts
   - University-filtered content by default
2. **Event Access**:
   - All users can view events
   - Only organizer can edit/delete events
   - Registration status tracked per user
3. **Marketplace Access**:
   - All users can view items
   - Only seller can edit/delete items
   - Item status managed by seller
4. **Messaging Access**:
   - Only conversation participants can view messages
   - Users can start conversations with any user
   - Message history preserved

### Analytics & Tracking
1. **View Tracking**: Track views for posts, events, marketplace items
2. **Engagement Metrics**: Track likes, comments, saves, registrations
3. **User Activity**: Track login times, last seen status
4. **Search Analytics**: Track popular search terms and filters

---

## Security Considerations

### Data Protection
1. **Password Security**: Bcrypt hashing with salt rounds ≥ 12
2. **SQL Injection Prevention**: Use parameterized queries/ORM
3. **XSS Prevention**: Sanitize user input, escape output
4. **CSRF Protection**: CSRF tokens for state-changing operations
5. **Data Encryption**: Encrypt sensitive data at rest

### API Security  
1. **Authentication**: JWT-based with proper expiration
2. **Authorization**: Role-based access control
3. **Rate Limiting**: Prevent abuse and DoS attacks
4. **Input Validation**: Validate all incoming data
5. **HTTPS Only**: Enforce SSL in production

### File Upload Security
1. **File Type Validation**: Only allow whitelisted image formats
2. **File Size Limits**: Prevent large file DoS attacks  
3. **Virus Scanning**: Scan uploaded files (production)
4. **Content Validation**: Verify file headers match extensions
5. **Secure Storage**: Store uploads outside web root

### Privacy & Compliance
1. **Data Minimization**: Only collect necessary user data
2. **User Consent**: Clear privacy policy and consent flows
3. **Data Retention**: Implement data retention policies
4. **Right to Deletion**: Allow users to delete their accounts
5. **Data Export**: Allow users to export their data

### Infrastructure Security
1. **Database Security**: Use connection pooling, prepared statements
2. **Environment Variables**: Never commit secrets to code
3. **Error Handling**: Don't expose internal details in error messages
4. **Logging**: Log security events and access attempts
5. **Monitoring**: Set up alerts for suspicious activity

---

## Implementation Checklist

### Phase 1: Core Backend (Week 1-2)
- [ ] Set up FastAPI project structure
- [ ] Configure database with SQLAlchemy
- [ ] Implement user authentication system
- [ ] Create basic CRUD operations for users
- [ ] Set up JWT token management
- [ ] Implement error handling middleware
- [ ] Add input validation with Pydantic models

### Phase 2: Core Features (Week 3-4)
- [ ] Implement posts API (CRUD, likes, comments)
- [ ] Build events management system
- [ ] Create marketplace functionality
- [ ] Add pagination for all list endpoints
- [ ] Implement search functionality
- [ ] Add file upload system
- [ ] Create university search integration

### Phase 3: Real-time Features (Week 5-6) 
- [ ] Implement WebSocket messaging system
- [ ] Add real-time notifications
- [ ] Build conversation management
- [ ] Add typing indicators and read receipts
- [ ] Implement online status tracking
- [ ] Add real-time post interactions

### Phase 4: Advanced Features (Week 7-8)
- [ ] Add comprehensive search with filters
- [ ] Implement analytics and view tracking
- [ ] Add reporting system for inappropriate content
- [ ] Create admin endpoints (optional)
- [ ] Add rate limiting and security headers
- [ ] Implement email notifications (optional)

### Phase 5: Production Ready (Week 9-10)
- [ ] Add comprehensive logging
- [ ] Set up monitoring and health checks
- [ ] Implement caching with Redis
- [ ] Add database migrations system
- [ ] Write comprehensive API documentation
- [ ] Add automated tests
- [ ] Deploy to production environment

---

## FastAPI Implementation Example

### Project Structure
```
app/
├── main.py                 # FastAPI app initialization
├── config.py              # Configuration settings
├── database.py            # Database connection
├── dependencies.py        # Common dependencies (auth, etc.)
├── models/                # SQLAlchemy models
│   ├── __init__.py
│   ├── user.py
│   ├── post.py
│   ├── event.py
│   └── ...
├── schemas/               # Pydantic models
│   ├── __init__.py
│   ├── user.py
│   ├── post.py
│   └── ...
├── services/              # Business logic
│   ├── __init__.py
│   ├── auth_service.py
│   ├── post_service.py
│   └── ...
├── routers/               # API route definitions
│   ├── __init__.py
│   ├── auth.py
│   ├── posts.py
│   ├── events.py
│   └── ...
├── utils/                 # Helper utilities
│   ├── __init__.py
│   ├── security.py
│   ├── file_utils.py
│   └── ...
└── tests/                 # Test files
    ├── __init__.py
    ├── test_auth.py
    └── ...
```

### Sample FastAPI Code

**main.py**:
```python
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn

from app.routers import auth, posts, events, marketplace, messaging, universities
from app.config import settings

app = FastAPI(
    title="Oruma Student Hub API",
    description="Backend API for Oruma Student Hub",
    version="1.0.0"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(marketplace.router, prefix="/api/marketplace", tags=["marketplace"])
app.include_router(messaging.router, prefix="/api", tags=["messaging"])
app.include_router(universities.router, prefix="/api/universities", tags=["universities"])

@app.get("/")
async def root():
    return {"message": "Oruma Student Hub API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3333, reload=settings.DEBUG)
```

This specification provides a comprehensive blueprint for building the Oruma Student Hub backend that will seamlessly integrate with the existing frontend codebase.