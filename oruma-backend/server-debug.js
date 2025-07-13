const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

console.log('🔧 Starting server debug mode...');
console.log('📋 Environment:', process.env.NODE_ENV);
console.log('🔑 JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
console.log('🌐 CORS_ORIGIN:', process.env.CORS_ORIGIN);

// Middleware
console.log('🔧 Setting up middleware...');

app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

console.log('✅ Middleware setup complete');

// In-memory storage
const users = [];
let userIdCounter = 1;

// Helper function to generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

// Simple health check
app.get('/health', (req, res) => {
  console.log('📋 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    users: users.length
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('🔐 Registration attempt:', req.body?.email);
  
  try {
    const { name, email, password, university } = req.body;

    // Validate input
    if (!name || !email || !password || !university) {
      console.log('❌ Registration failed: Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      console.log('❌ Registration failed: User exists');
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const newUser = {
      id: userIdCounter.toString(),
      name,
      email,
      university,
      createdAt: new Date()
    };

    users.push(newUser);
    userIdCounter++;

    // Generate tokens
    const token = generateToken(newUser.id);
    const refreshToken = generateToken(newUser.id + '_refresh');

    console.log('✅ User registered successfully:', email);

    // Return response
    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        university: newUser.university
      }
    });
  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body?.email);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Login failed: Missing credentials');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('❌ Login failed: User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateToken(user.id + '_refresh');

    console.log('✅ User logged in successfully:', email);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        university: user.university
      }
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test middleware
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint hit');
  res.json({ message: 'Server is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❓ 404 - Route not found:', req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Debug Server running on http://localhost:${PORT}`);
  console.log(`📋 Registered users: ${users.length}`);
  console.log('🔧 Ready for requests!');
});