from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn
import os
from contextlib import asynccontextmanager

from app.config import settings
from app.database import create_tables
from app.routers import auth, posts, events, marketplace, messaging, universities, websocket as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="Oruma Student Hub API",
    description="Backend API for Oruma Student Hub - A social platform for university students",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host Middleware
if not settings.API_DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.oruma.com"]
    )

# Static files for uploads
if os.path.exists(settings.UPLOAD_PATH):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_PATH), name="uploads")

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail if isinstance(exc.detail, dict) else {"error": "HTTP Exception", "message": str(exc.detail)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    if settings.API_DEBUG:
        import traceback
        traceback.print_exc()
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred"
        }
    )

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(marketplace.router, prefix="/api/marketplace", tags=["Marketplace"])
app.include_router(messaging.router, prefix="/api", tags=["Messaging"])
app.include_router(universities.router, prefix="/api/universities", tags=["Universities"])
app.include_router(ws_router.router, prefix="/ws", tags=["WebSocket"])

# Root endpoints
@app.get("/")
async def root():
    return {
        "message": "Oruma Student Hub API", 
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/api")
async def api_info():
    return {
        "name": "Oruma Student Hub API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "posts": "/api/posts", 
            "events": "/api/events",
            "marketplace": "/api/marketplace",
            "messaging": "/api",
            "universities": "/api/universities",
            "websocket": "/ws"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )