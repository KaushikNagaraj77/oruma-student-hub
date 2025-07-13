# 🚀 Oruma Student Hub - Quick Setup Guide

This guide will help you set up the development environment with proper port configuration and environment variables.

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## 🛠️ Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# 1. Install all dependencies
npm run setup

# 2. Copy environment files  
npm run setup:env

# 3. Install concurrently for running both servers
npm install

# 4. Start both frontend and backend together
npm run dev:full
```

### Option 2: Manual Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd oruma-backend
npm install dotenv
cd ..

# 3. Copy environment files
cp .env.example .env
cd oruma-backend
cp .env.example .env
cd ..

# 4. Start backend (Terminal 1)
npm run backend

# 5. Start frontend (Terminal 2)
npm run dev
```

## 🌐 Application URLs

After setup, your application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Backend Health Check**: http://localhost:3001/health

## 🔧 Port Configuration

The application uses fixed ports to prevent conflicts:

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 3000 | http://localhost:3000 |
| Backend (Express) | 3001 | http://localhost:3001 |

### Changing Ports

If you need to use different ports:

1. **Frontend**: Update `VITE_PORT` in `.env`
2. **Backend**: Update `PORT` in `oruma-backend/.env`
3. **Update API URLs**: Update `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` in `.env`

## 📁 Environment Variables

### Frontend (.env)
```env
VITE_PORT=3000
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_BASE_URL=ws://localhost:3001
NODE_ENV=development
```

### Backend (oruma-backend/.env)
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:3000
```

## 🎯 Features Enabled

The application includes the following features:

- ✅ **Authentication System** - JWT-based login/signup
- ✅ **Social Feed** - Posts, likes, comments, saves
- ✅ **Marketplace** - Buy/sell items with image upload
- ✅ **Messaging System** - Real-time chat (WebSocket)
- ✅ **University Search** - Integration with university API
- ✅ **User Profiles** - Complete user management

## 🚦 Available Scripts

### Development
```bash
npm run dev          # Start frontend only
npm run backend      # Start backend only  
npm run dev:full     # Start both frontend and backend
```

### Setup
```bash
npm run setup        # Install all dependencies
npm run setup:env    # Copy environment files
```

### Build & Deploy
```bash
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linting
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Kill process using port 3001  
lsof -ti:3001 | xargs kill -9
```

### API Connection Issues
1. Verify both servers are running
2. Check browser console for configuration logs
3. Ensure `VITE_API_BASE_URL` matches backend port

### Database Connection (Future)
The application currently uses in-memory storage. To add a database:

1. Install database dependencies (e.g., MongoDB, PostgreSQL)
2. Add `DATABASE_URL` to backend `.env`
3. Update server.js to use database instead of in-memory arrays

## 🧪 Testing the Setup

1. **Authentication**: Register a new user at http://localhost:3000
2. **API Health**: Visit http://localhost:3001/health
3. **Marketplace**: Create a new item listing
4. **Social Feed**: Create a post and interact with it
5. **WebSocket**: Open browser dev tools and check WebSocket connection

## 📦 Project Structure

```
oruma-student-hub/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── contexts/           # React contexts
│   ├── utils/              # Utilities (including config.ts)
│   └── ...
├── oruma-backend/
│   ├── server.js           # Express server
│   ├── .env               # Backend environment
│   └── package.json       # Backend dependencies
├── .env                   # Frontend environment
├── vite.config.ts         # Vite configuration
└── package.json           # Frontend dependencies
```

## 🌟 Next Steps

After setup, you can:

1. **Customize Branding**: Update colors, logos, and text
2. **Add Database**: Replace in-memory storage with a real database
3. **Deploy**: Configure for production deployment
4. **Add Features**: Extend with new functionality
5. **Testing**: Add unit and integration tests

## 🆘 Need Help?

- Check the browser console for configuration logs (development mode)
- Verify environment variables are loaded correctly
- Ensure all dependencies are installed
- Check that both servers are running on the correct ports

---

**Happy Coding! 🎉**