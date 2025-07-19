# Oruma Student Hub - FastAPI Backend

A complete FastAPI backend implementation for the Oruma Student Hub social platform.

## Features

- **Authentication**: JWT-based auth with refresh tokens
- **Posts**: Social media posts with comments, likes, saves
- **Events**: Event management with registration system
- **Marketplace**: Buy/sell items with image uploads
- **Messaging**: Real-time messaging with WebSocket
- **Universities**: University search and management
- **File Uploads**: Image handling for posts, events, marketplace

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL 14+
- pip or poetry

### 1. Setup Environment

```bash
# Clone and navigate to backend
cd oruma-backend-fastapi

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Start PostgreSQL (using Docker)
docker run --name oruma-postgres \
  -e POSTGRES_USER=oruma_user \
  -e POSTGRES_PASSWORD=oruma_password \
  -e POSTGRES_DB=oruma_db \
  -p 5432:5432 \
  -d postgres:14

# Or create manually in your PostgreSQL instance:
# CREATE DATABASE oruma_db;
# CREATE USER oruma_user WITH PASSWORD 'oruma_password';
# GRANT ALL PRIVILEGES ON DATABASE oruma_db TO oruma_user;
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
# At minimum, set:
# - DATABASE_URL
# - JWT_SECRET_KEY (generate a secure random key)
```

### 4. Initialize Database

```bash
# Run database migrations
alembic upgrade head

# Or create tables directly (for development)
python -c "from app.database import create_tables; create_tables()"
```

### 5. Run the Server

```bash
# Development server
uvicorn app.main:app --reload --port 3333

# Production server
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:3333
```

The API will be available at `http://localhost:3333`

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:3333/docs
- **ReDoc**: http://localhost:3333/redoc

## Project Structure

```
app/
├── main.py              # FastAPI application
├── config.py           # Configuration settings
├── database.py         # Database connection
├── dependencies.py     # Common dependencies
├── models/             # SQLAlchemy models
├── schemas/           # Pydantic schemas
├── services/          # Business logic
├── routers/           # API endpoints
├── utils/             # Utility functions
└── websocket/         # WebSocket implementation
```

## Environment Variables

Key environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/oruma_db

# Authentication
JWT_SECRET_KEY=your-super-secret-key-here
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

# API
API_PORT=3333
API_DEBUG=true
CORS_ORIGINS=["http://localhost:5173"]

# File Storage
UPLOAD_DIR=uploads
FILE_MAX_SIZE_MB=10
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration  
- `GET /me` - Get current user
- `POST /logout` - User logout
- `POST /refresh` - Refresh token

### Posts (`/api/posts`)
- `GET /` - Get posts feed
- `POST /` - Create post
- `GET /{id}` - Get specific post
- `PUT /{id}` - Update post
- `DELETE /{id}` - Delete post
- `POST /{id}/like` - Like/unlike post
- `POST /{id}/save` - Save/unsave post
- `GET /{id}/comments` - Get comments
- `POST /{id}/comments` - Create comment

### Events (`/api/events`)
- `GET /` - Get events
- `POST /` - Create event
- `GET /{id}` - Get event details
- `PUT /{id}` - Update event
- `DELETE /{id}` - Delete event
- `POST /{id}/register` - Register for event
- `POST /{id}/unregister` - Unregister from event
- `POST /{id}/save` - Save event

### Marketplace (`/api/marketplace`)
- `GET /items` - Get marketplace items
- `POST /items` - Create item
- `GET /items/{id}` - Get item details
- `PUT /items/{id}` - Update item
- `DELETE /items/{id}` - Delete item
- `POST /items/{id}/save` - Save item

### Messaging (`/api`)
- `GET /conversations` - Get conversations
- `POST /conversations` - Create conversation
- `GET /conversations/{id}/messages` - Get messages
- `POST /messages` - Send message
- `GET /users/search` - Search users

### Universities (`/api/universities`)
- `GET /search` - Search universities
- `GET /{id}` - Get university details

### WebSocket (`/ws`)
- Real-time messaging
- Live notifications
- User presence

## Database Schema

Key tables:
- `users` - User accounts
- `posts` - Social media posts  
- `comments` - Post comments
- `events` - Event listings
- `marketplace_items` - Items for sale
- `conversations` - Chat conversations
- `messages` - Chat messages

## File Uploads

Supports image uploads for:
- Posts (max 5 images)
- Events (1 banner image)
- Marketplace items (max 8 images)

Files are stored in `/uploads/{category}/` and served at `/uploads/{category}/{filename}`

## WebSocket Events

Real-time events:
- `message_received` - New message
- `message_read` - Message read receipt
- `user_typing` - Typing indicators
- `user_online` - User presence
- `post_liked` - Post interactions

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py -v
```

## Development

### Adding New Endpoints

1. Create Pydantic schemas in `schemas/`
2. Add business logic to `services/`
3. Create API routes in `routers/`
4. Include router in `main.py`

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Production Deployment

1. Set `API_DEBUG=false` in environment
2. Use strong `JWT_SECRET_KEY`
3. Configure proper CORS origins
4. Use PostgreSQL with connection pooling
5. Set up proper logging and monitoring
6. Use reverse proxy (nginx) for static files
7. Enable HTTPS

## Security Considerations

- JWT tokens with reasonable expiration
- Password hashing with bcrypt
- Input validation and sanitization
- File upload security
- Rate limiting (implement with Redis)
- HTTPS in production

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database and user exist

2. **Import errors**
   - Activate virtual environment
   - Install requirements.txt
   - Check Python path

3. **File upload fails**
   - Ensure uploads directory exists
   - Check file permissions
   - Verify file size limits

4. **CORS errors**
   - Add frontend URL to CORS_ORIGINS
   - Check preflight request handling

### Logs

Check application logs for detailed error information:
```bash
# Development
tail -f logs/app.log

# Production (systemd)
journalctl -u oruma-api -f
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request