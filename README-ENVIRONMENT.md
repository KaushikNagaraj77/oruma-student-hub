# Environment Configuration Guide

This document explains the environment configuration setup for the Oruma Student Hub application.

## Port Configuration

The application now uses fixed, configurable ports to prevent conflicts:

- **Frontend (Vite)**: Port 3000
- **Backend (Express)**: Port 3001

## Environment Files

### Frontend (.env)
```env
# Frontend Configuration
VITE_PORT=3000

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_BASE_URL=ws://localhost:3001

# Environment
NODE_ENV=development

# API endpoints
VITE_AUTH_ENDPOINT=/api/auth
VITE_POSTS_ENDPOINT=/api/posts
VITE_MARKETPLACE_ENDPOINT=/api/marketplace
VITE_MESSAGES_ENDPOINT=/api/messages

# Feature flags
VITE_ENABLE_WEBSOCKETS=true
VITE_ENABLE_MARKETPLACE=true
VITE_ENABLE_MESSAGING=true
```

### Backend (oruma-backend/.env)
```env
# Backend Server Configuration
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Setup Instructions

1. **Install dependencies** (if not already done):
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd oruma-backend
   npm install
   ```

2. **Copy environment files**:
   ```bash
   # Frontend
   cp .env.example .env
   
   # Backend
   cd oruma-backend
   cp .env.example .env
   ```

3. **Install backend dependencies** (dotenv was added):
   ```bash
   cd oruma-backend
   npm install dotenv
   ```

4. **Start the applications**:
   ```bash
   # Terminal 1 - Backend
   cd oruma-backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

## Configuration Features

### Environment Configuration Utility
The `src/utils/config.ts` file provides a centralized configuration system:

```typescript
import Config from './utils/config';

// Access API URLs
Config.API_BASE_URL        // http://localhost:3001
Config.WEBSOCKET_URL       // ws://localhost:3001/ws
Config.AUTH_API_URL        // http://localhost:3001/api/auth

// Feature flags
Config.ENABLE_MARKETPLACE  // true/false
Config.IS_DEVELOPMENT      // true in dev mode
```

### API Services
All API services now use environment-based configuration:
- `authApi.ts` - Authentication endpoints
- `postsApi.ts` - Posts and social feed endpoints  
- `marketplaceApi.ts` - Marketplace endpoints
- `websocketService.ts` - WebSocket connections

### Proxy Configuration
Vite is configured to proxy API calls:
- `/api/*` → `http://localhost:3001`
- `/ws` → `ws://localhost:3001` (WebSocket)

## Production Configuration

For production, update the environment variables:

```env
# Frontend (.env.production)
VITE_API_BASE_URL=https://your-api-domain.com
VITE_WS_BASE_URL=wss://your-api-domain.com

# Backend
PORT=8080
NODE_ENV=production
JWT_SECRET=your-secure-production-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

## Troubleshooting

### Port Already in Use
If you get a port conflict:
1. Change the port in the `.env` file
2. Restart the application
3. Update the corresponding URLs in both frontend and backend configs

### API Connection Issues
1. Check that both frontend and backend are running
2. Verify the `VITE_API_BASE_URL` matches the backend port
3. Check browser console for configuration logs (development only)

### WebSocket Connection Issues
1. Verify `VITE_WS_BASE_URL` is correct
2. Check that the backend supports WebSocket connections
3. Ensure authentication token is valid

## Development Tips

- Configuration is logged to console in development mode
- Use `.env.example` files as templates
- Never commit actual `.env` files to version control
- All API services automatically use the environment configuration
- Feature flags allow enabling/disabling functionality per environment