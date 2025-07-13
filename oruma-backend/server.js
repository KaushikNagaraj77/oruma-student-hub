const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'; // In production, use environment variable

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// In-memory storage (replace with database in production)
const users = [];
const posts = [];
const comments = [];
const marketplaceItems = [];
const events = [
  {
    id: '1',
    organizerId: '1',
    title: 'Tech Career Fair 2024',
    description: 'Join us for the biggest tech career fair of the year! Meet with top companies, learn about internship opportunities, and network with industry professionals.',
    category: 'Career',
    date: '2024-03-15',
    startTime: '10:00',
    endTime: '16:00',
    location: 'Student Union Building, Main Hall',
    capacity: 500,
    registrationRequired: true,
    bannerImage: null,
    organizer: {
      id: '1',
      name: 'Career Services',
      username: 'careerservices',
      university: 'University of Technology',
      avatar: null
    },
    attendees: 127,
    maxAttendees: 500,
    isRegistered: false,
    status: 'upcoming',
    tags: ['career', 'networking', 'tech', 'internships'],
    university: 'University of Technology',
    views: 234,
    saves: 45,
    saved: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    organizerId: '1',
    title: 'Spring Music Festival',
    description: 'Get ready for an amazing evening of live music featuring local bands and student performers. Food trucks will be available!',
    category: 'Cultural',
    date: '2024-03-22',
    startTime: '18:00',
    endTime: '23:00',
    location: 'Campus Quad',
    capacity: 1000,
    registrationRequired: false,
    bannerImage: null,
    organizer: {
      id: '1',
      name: 'Student Activities',
      username: 'studentactivities',
      university: 'University of Technology',
      avatar: null
    },
    attendees: 0,
    maxAttendees: 1000,
    isRegistered: false,
    status: 'upcoming',
    tags: ['music', 'festival', 'entertainment', 'food'],
    university: 'University of Technology',
    views: 156,
    saves: 23,
    saved: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    organizerId: '1',
    title: 'Study Group: Advanced Algorithms',
    description: 'Weekly study group for CS students taking Advanced Algorithms. We cover practice problems, discuss concepts, and prepare for exams together.',
    category: 'Academic',
    date: '2024-03-18',
    startTime: '19:00',
    endTime: '21:00',
    location: 'Library Study Room 204',
    capacity: 12,
    registrationRequired: true,
    bannerImage: null,
    organizer: {
      id: '1',
      name: 'Alex Chen',
      username: 'alexchen',
      university: 'University of Technology',
      avatar: null
    },
    attendees: 8,
    maxAttendees: 12,
    isRegistered: false,
    status: 'upcoming',
    tags: ['study', 'algorithms', 'computer-science', 'weekly'],
    university: 'University of Technology',
    views: 89,
    saves: 12,
    saved: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];
const savedItems = new Map(); // userId -> Set of itemIds
const savedEvents = new Map(); // userId -> Set of eventIds
const eventRegistrations = new Map(); // userId -> Set of eventIds
let userIdCounter = 1;
let postIdCounter = 1;
let commentIdCounter = 1;
let itemIdCounter = 1;
let eventIdCounter = 1;

// Helper function to generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

// Middleware to authenticate requests
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Helper function to generate sample posts
function generateSamplePosts() {
  if (posts.length === 0 && users.length > 0) {
    const samplePosts = [
      {
        id: '1',
        authorId: users[0]?.id || '1',
        author: users[0]?.name || 'Sample User',
        username: users[0]?.email?.split('@')[0] || 'sampleuser',
        university: users[0]?.university || 'Sample University',
        time: '2h ago',
        location: 'Library',
        content: 'Just finished my final exam! Feeling relieved and excited for summer break 🎉 #finals #done',
        likes: 15,
        comments: 3,
        saves: 2,
        images: [],
        liked: false,
        saved: false,
        type: 'achievement',
        hashtags: ['finals', 'done'],
        mentions: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        authorId: users[0]?.id || '1',
        author: users[0]?.name || 'Sample User',
        username: users[0]?.email?.split('@')[0] || 'sampleuser',
        university: users[0]?.university || 'Sample University',
        time: '4h ago',
        location: 'Student Center',
        content: 'Looking for study partners for organic chemistry. Anyone interested in forming a study group? 📚 #studygroup #chemistry',
        likes: 8,
        comments: 5,
        saves: 12,
        images: [],
        liked: false,
        saved: false,
        type: 'study',
        hashtags: ['studygroup', 'chemistry'],
        mentions: [],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        authorId: users[0]?.id || '1',
        author: users[0]?.name || 'Sample User',
        username: users[0]?.email?.split('@')[0] || 'sampleuser',
        university: users[0]?.university || 'Sample University',
        time: '6h ago',
        location: 'Dining Hall',
        content: 'The new sushi bar in the dining hall is amazing! 🍣 Finally some good food on campus #food #sushi',
        likes: 23,
        comments: 7,
        saves: 4,
        images: [],
        liked: true,
        saved: false,
        type: 'food',
        hashtags: ['food', 'sushi'],
        mentions: [],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    posts.push(...samplePosts);
    postIdCounter = samplePosts.length + 1;
    console.log(`✅ Generated ${samplePosts.length} sample posts`);
  }
}

// Routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, university } = req.body;

    // Validate input
    if (!name || !email || !password || !university) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
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

    console.log(`✅ User registered: ${newUser.email}`);
    
    // Generate sample posts after first user registration
    generateSamplePosts();
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // In production, verify password hash
    // For demo, we'll accept any password

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateToken(user.id + '_refresh');

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

    console.log(`✅ User logged in: ${user.email}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      university: user.university
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // In production, you'd invalidate the token
  res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    // In production, verify refresh token properly
    const token = generateToken('user-id');
    const newRefreshToken = generateToken('user-id_refresh');

    res.json({ token, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// ==================== POSTS API ENDPOINTS ====================

// Get posts (with pagination)
app.get('/api/posts', authenticateToken, (req, res) => {
  try {
    console.log('📋 GET /api/posts - User:', req.user.email);
    
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;
    
    // Generate sample posts if none exist
    generateSamplePosts();
    
    let filteredPosts = [...posts];
    
    // Apply cursor-based pagination
    if (cursor) {
      const cursorIndex = filteredPosts.findIndex(post => post.id === cursor);
      if (cursorIndex !== -1) {
        filteredPosts = filteredPosts.slice(cursorIndex + 1);
      }
    }
    
    // Apply limit
    const paginatedPosts = filteredPosts.slice(0, limit);
    const hasMore = filteredPosts.length > limit;
    const nextCursor = hasMore ? paginatedPosts[paginatedPosts.length - 1].id : undefined;
    
    console.log(`✅ Returning ${paginatedPosts.length} posts, hasMore: ${hasMore}`);
    
    res.json({
      posts: paginatedPosts,
      hasMore,
      nextCursor
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Get single post
app.get('/api/posts/:postId', authenticateToken, (req, res) => {
  try {
    const { postId } = req.params;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

// Create new post
app.post('/api/posts', authenticateToken, (req, res) => {
  try {
    const { content, type, location, hashtags, mentions } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const newPost = {
      id: postIdCounter.toString(),
      authorId: req.user.id,
      author: req.user.name,
      username: req.user.email.split('@')[0],
      university: req.user.university,
      time: 'now',
      location: location || '',
      content: content.trim(),
      likes: 0,
      comments: 0,
      saves: 0,
      images: [],
      liked: false,
      saved: false,
      type: type || 'general',
      hashtags: hashtags || [],
      mentions: mentions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    posts.unshift(newPost); // Add to beginning
    postIdCounter++;
    
    console.log(`✅ Created post: ${newPost.id} by ${req.user.email}`);
    
    res.status(201).json({ post: newPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Like/Unlike post
app.post('/api/posts/:postId/like', authenticateToken, (req, res) => {
  try {
    const { postId } = req.params;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Toggle like status
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    post.updatedAt = new Date().toISOString();
    
    console.log(`✅ ${post.liked ? 'Liked' : 'Unliked'} post: ${postId}`);
    
    res.json({
      liked: post.liked,
      likesCount: post.likes
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
});

// Save/Unsave post
app.post('/api/posts/:postId/save', authenticateToken, (req, res) => {
  try {
    const { postId } = req.params;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Toggle save status
    post.saved = !post.saved;
    post.saves += post.saved ? 1 : -1;
    post.updatedAt = new Date().toISOString();
    
    console.log(`✅ ${post.saved ? 'Saved' : 'Unsaved'} post: ${postId}`);
    
    res.json({ saved: post.saved });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ message: 'Failed to save post' });
  }
});

// Get comments for a post
app.get('/api/posts/:postId/comments', authenticateToken, (req, res) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const postComments = comments.filter(c => c.postId === postId);
    const paginatedComments = postComments.slice(0, limit);
    
    res.json({
      comments: paginatedComments,
      hasMore: postComments.length > limit,
      nextCursor: undefined
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Create comment
app.post('/api/posts/:postId/comments', authenticateToken, (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const newComment = {
      id: commentIdCounter.toString(),
      postId,
      authorId: req.user.id,
      author: req.user.name,
      username: req.user.email.split('@')[0],
      content: content.trim(),
      likes: 0,
      liked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: parentId || null,
      replies: []
    };
    
    comments.push(newComment);
    commentIdCounter++;
    
    // Update post comment count
    post.comments++;
    post.updatedAt = new Date().toISOString();
    
    console.log(`✅ Created comment: ${newComment.id} on post ${postId}`);
    
    res.status(201).json({ comment: newComment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// Search posts
app.get('/api/posts/search', authenticateToken, (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = query.toLowerCase();
    const filteredPosts = posts.filter(post => 
      post.content.toLowerCase().includes(searchTerm) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.author.toLowerCase().includes(searchTerm)
    );
    
    const paginatedPosts = filteredPosts.slice(0, parseInt(limit));
    
    res.json({
      posts: paginatedPosts,
      hasMore: filteredPosts.length > parseInt(limit),
      nextCursor: undefined
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Failed to search posts' });
  }
});

// Helper function to generate sample marketplace items
function generateSampleMarketplaceItems() {
  if (marketplaceItems.length === 0 && users.length > 0) {
    const sampleItems = [
      {
        id: '1',
        sellerId: users[0]?.id || '1',
        title: 'MacBook Pro 13" 2021',
        description: 'Barely used MacBook Pro perfect for students. This laptop has been my reliable companion throughout my computer science studies, but I\'m upgrading to a newer model. It comes with the original charger, a premium leather case, and all original packaging. The battery health is still at 96%, and there are no scratches or dents. Perfect for programming, design work, and everyday tasks.',
        price: 1200,
        condition: 'Like New',
        category: 'Electronics',
        images: [
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&h=600',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&h=600',
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&h=600'
        ],
        specifications: [
          { label: 'Model', value: 'MacBook Pro 13-inch 2021' },
          { label: 'Processor', value: 'Apple M1 Chip' },
          { label: 'Memory', value: '8GB RAM' },
          { label: 'Storage', value: '256GB SSD' },
          { label: 'Color', value: 'Space Gray' }
        ],
        seller: {
          id: users[0]?.id || '1',
          name: users[0]?.name || 'Emma Davis',
          username: users[0]?.email?.split('@')[0] || 'emma',
          university: users[0]?.university || 'Stanford University',
          rating: 4.9,
          reviewCount: 47,
          avatar: null
        },
        location: 'Stanford Campus',
        tags: ['laptop', 'apple', 'macbook', 'student'],
        status: 'available',
        views: 156,
        saves: 23,
        saved: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        sellerId: users[0]?.id || '1',
        title: 'Calculus Textbook Bundle',
        description: 'Complete calculus textbook set with solution manual. Great condition with minimal highlighting. Perfect for Math 51 and 52 series. Includes supplementary practice problems and online access codes (may be expired).',
        price: 80,
        condition: 'Good',
        category: 'Textbooks',
        images: [
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&h=600'
        ],
        specifications: [
          { label: 'Author', value: 'James Stewart' },
          { label: 'Edition', value: '8th Edition' },
          { label: 'Subject', value: 'Calculus' },
          { label: 'Condition', value: 'Good - Minor highlighting' }
        ],
        seller: {
          id: users[0]?.id || '1',
          name: users[0]?.name || 'Mike Johnson',
          username: users[0]?.email?.split('@')[0] || 'mike',
          university: users[0]?.university || 'MIT',
          rating: 4.7,
          reviewCount: 32,
          avatar: null
        },
        location: 'MIT Campus',
        tags: ['textbook', 'calculus', 'math', 'stewart'],
        status: 'available',
        views: 89,
        saves: 12,
        saved: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        sellerId: users[0]?.id || '1',
        title: 'Mini Fridge - Perfect for Dorms',
        description: 'Compact refrigerator ideal for dorm rooms. Energy efficient and quiet operation. Has been kept in excellent condition with regular cleaning. Perfect size for drinks, snacks, and small food items.',
        price: 150,
        condition: 'Excellent',
        category: 'Furniture',
        images: [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&h=600'
        ],
        specifications: [
          { label: 'Capacity', value: '3.2 cubic feet' },
          { label: 'Brand', value: 'Danby' },
          { label: 'Color', value: 'Black' },
          { label: 'Energy Star', value: 'Yes' }
        ],
        seller: {
          id: users[0]?.id || '1',
          name: users[0]?.name || 'Sarah Wilson',
          username: users[0]?.email?.split('@')[0] || 'sarah',
          university: users[0]?.university || 'UC Berkeley',
          rating: 5.0,
          reviewCount: 28,
          avatar: null
        },
        location: 'UC Berkeley',
        tags: ['fridge', 'dorm', 'appliance', 'mini'],
        status: 'available',
        views: 134,
        saves: 31,
        saved: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    marketplaceItems.push(...sampleItems);
    itemIdCounter = sampleItems.length + 1;
    console.log(`✅ Generated ${sampleItems.length} sample marketplace items`);
  }
}

// ==================== MARKETPLACE API ENDPOINTS ====================

// Get marketplace items (with pagination and filtering)
app.get('/api/marketplace/items', authenticateToken, (req, res) => {
  try {
    console.log('🛒 GET /api/marketplace/items - User:', req.user.email);
    
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor;
    const category = req.query.category;
    const condition = req.query.condition;
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : undefined;
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : undefined;
    const university = req.query.university;
    const sortBy = req.query.sortBy || 'recent';
    
    // Generate sample items if none exist
    generateSampleMarketplaceItems();
    
    let filteredItems = [...marketplaceItems];
    
    // Apply filters
    if (category) {
      filteredItems = filteredItems.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (condition) {
      const conditions = Array.isArray(condition) ? condition : [condition];
      filteredItems = filteredItems.filter(item => 
        conditions.includes(item.condition)
      );
    }
    
    if (priceMin !== undefined) {
      filteredItems = filteredItems.filter(item => item.price >= priceMin);
    }
    
    if (priceMax !== undefined) {
      filteredItems = filteredItems.filter(item => item.price <= priceMax);
    }
    
    if (university) {
      filteredItems = filteredItems.filter(item => 
        item.seller.university.toLowerCase().includes(university.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filteredItems.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filteredItems.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filteredItems.sort((a, b) => b.views - a.views);
        break;
      case 'recent':
      default:
        filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    // Apply cursor-based pagination
    if (cursor) {
      const cursorIndex = filteredItems.findIndex(item => item.id === cursor);
      if (cursorIndex !== -1) {
        filteredItems = filteredItems.slice(cursorIndex + 1);
      }
    }
    
    // Apply limit
    const paginatedItems = filteredItems.slice(0, limit);
    const hasMore = filteredItems.length > limit;
    const nextCursor = hasMore ? paginatedItems[paginatedItems.length - 1].id : undefined;
    
    // Add saved status for current user
    const userSavedItems = savedItems.get(req.user.id) || new Set();
    paginatedItems.forEach(item => {
      item.saved = userSavedItems.has(item.id);
    });
    
    console.log(`✅ Returning ${paginatedItems.length} marketplace items, hasMore: ${hasMore}`);
    
    res.json({
      items: paginatedItems,
      hasMore,
      nextCursor,
      total: filteredItems.length
    });
  } catch (error) {
    console.error('Get marketplace items error:', error);
    res.status(500).json({ message: 'Failed to fetch marketplace items' });
  }
});

// Get single marketplace item
app.get('/api/marketplace/items/:itemId', authenticateToken, (req, res) => {
  try {
    const { itemId } = req.params;
    const item = marketplaceItems.find(i => i.id === itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Increment view count
    item.views++;
    
    // Add saved status for current user
    const userSavedItems = savedItems.get(req.user.id) || new Set();
    item.saved = userSavedItems.has(item.id);
    
    console.log(`✅ Returning marketplace item: ${itemId}`);
    res.json(item);
  } catch (error) {
    console.error('Get marketplace item error:', error);
    res.status(500).json({ message: 'Failed to fetch marketplace item' });
  }
});

// Create new marketplace item
app.post('/api/marketplace/items', authenticateToken, (req, res) => {
  try {
    const { title, description, price, condition, category, specifications, location, tags } = req.body;
    
    if (!title || !description || !price || !condition || !category) {
      return res.status(400).json({ message: 'Title, description, price, condition, and category are required' });
    }
    
    const newItem = {
      id: itemIdCounter.toString(),
      sellerId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      condition,
      category,
      images: [],
      specifications: specifications || [],
      seller: {
        id: req.user.id,
        name: req.user.name,
        username: req.user.email.split('@')[0],
        university: req.user.university,
        rating: 5.0,
        reviewCount: 0,
        avatar: null
      },
      location: location || '',
      tags: tags || [],
      status: 'available',
      views: 0,
      saves: 0,
      saved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    marketplaceItems.unshift(newItem);
    itemIdCounter++;
    
    console.log(`✅ Created marketplace item: ${newItem.id} by ${req.user.email}`);
    
    res.status(201).json({ item: newItem });
  } catch (error) {
    console.error('Create marketplace item error:', error);
    res.status(500).json({ message: 'Failed to create marketplace item' });
  }
});

// Update marketplace item
app.put('/api/marketplace/items/:itemId', authenticateToken, (req, res) => {
  try {
    const { itemId } = req.params;
    const item = marketplaceItems.find(i => i.id === itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    
    const { title, description, price, condition, category, specifications, location, tags, status } = req.body;
    
    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (price !== undefined) item.price = parseFloat(price);
    if (condition) item.condition = condition;
    if (category) item.category = category;
    if (specifications) item.specifications = specifications;
    if (location !== undefined) item.location = location;
    if (tags) item.tags = tags;
    if (status) item.status = status;
    
    item.updatedAt = new Date().toISOString();
    
    console.log(`✅ Updated marketplace item: ${itemId}`);
    res.json(item);
  } catch (error) {
    console.error('Update marketplace item error:', error);
    res.status(500).json({ message: 'Failed to update marketplace item' });
  }
});

// Delete marketplace item
app.delete('/api/marketplace/items/:itemId', authenticateToken, (req, res) => {
  try {
    const { itemId } = req.params;
    const itemIndex = marketplaceItems.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const item = marketplaceItems[itemIndex];
    
    if (item.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    
    marketplaceItems.splice(itemIndex, 1);
    
    // Remove from all users' saved items
    for (const [userId, userSavedItems] of savedItems.entries()) {
      userSavedItems.delete(itemId);
    }
    
    console.log(`✅ Deleted marketplace item: ${itemId}`);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete marketplace item error:', error);
    res.status(500).json({ message: 'Failed to delete marketplace item' });
  }
});

// Save/Unsave marketplace item
app.post('/api/marketplace/items/:itemId/save', authenticateToken, (req, res) => {
  try {
    const { itemId } = req.params;
    const item = marketplaceItems.find(i => i.id === itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (!savedItems.has(req.user.id)) {
      savedItems.set(req.user.id, new Set());
    }
    
    const userSavedItems = savedItems.get(req.user.id);
    const wasSaved = userSavedItems.has(itemId);
    
    if (wasSaved) {
      userSavedItems.delete(itemId);
      item.saves = Math.max(0, item.saves - 1);
    } else {
      userSavedItems.add(itemId);
      item.saves++;
    }
    
    const nowSaved = !wasSaved;
    item.updatedAt = new Date().toISOString();
    
    console.log(`✅ ${nowSaved ? 'Saved' : 'Unsaved'} marketplace item: ${itemId}`);
    
    res.json({
      saved: nowSaved,
      savesCount: item.saves
    });
  } catch (error) {
    console.error('Save marketplace item error:', error);
    res.status(500).json({ message: 'Failed to save marketplace item' });
  }
});

// Search marketplace items
app.get('/api/marketplace/items/search', authenticateToken, (req, res) => {
  try {
    const { q: query, limit = 20, category, condition, priceMin, priceMax, university, sortBy = 'recent' } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = query.toLowerCase();
    let filteredItems = marketplaceItems.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      item.seller.name.toLowerCase().includes(searchTerm)
    );
    
    // Apply additional filters (same as getItems)
    if (category) {
      filteredItems = filteredItems.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (condition) {
      const conditions = Array.isArray(condition) ? condition : [condition];
      filteredItems = filteredItems.filter(item => 
        conditions.includes(item.condition)
      );
    }
    
    if (priceMin !== undefined) {
      filteredItems = filteredItems.filter(item => item.price >= parseFloat(priceMin));
    }
    
    if (priceMax !== undefined) {
      filteredItems = filteredItems.filter(item => item.price <= parseFloat(priceMax));
    }
    
    if (university) {
      filteredItems = filteredItems.filter(item => 
        item.seller.university.toLowerCase().includes(university.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filteredItems.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filteredItems.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filteredItems.sort((a, b) => b.views - a.views);
        break;
      case 'recent':
      default:
        filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    const paginatedItems = filteredItems.slice(0, parseInt(limit));
    
    // Add saved status for current user
    const userSavedItems = savedItems.get(req.user.id) || new Set();
    paginatedItems.forEach(item => {
      item.saved = userSavedItems.has(item.id);
    });
    
    res.json({
      items: paginatedItems,
      hasMore: filteredItems.length > parseInt(limit),
      nextCursor: undefined,
      total: filteredItems.length
    });
  } catch (error) {
    console.error('Search marketplace items error:', error);
    res.status(500).json({ message: 'Failed to search marketplace items' });
  }
});

// Get marketplace categories
app.get('/api/marketplace/categories', authenticateToken, (req, res) => {
  try {
    const categoryCount = {};
    
    marketplaceItems.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    
    const categories = Object.entries(categoryCount).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      count
    }));
    
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get user's marketplace items
app.get('/api/marketplace/users/:userId/items', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor;
    
    let userItems = marketplaceItems.filter(item => item.sellerId === userId);
    
    // Apply cursor-based pagination
    if (cursor) {
      const cursorIndex = userItems.findIndex(item => item.id === cursor);
      if (cursorIndex !== -1) {
        userItems = userItems.slice(cursorIndex + 1);
      }
    }
    
    const paginatedItems = userItems.slice(0, limit);
    const hasMore = userItems.length > limit;
    const nextCursor = hasMore ? paginatedItems[paginatedItems.length - 1].id : undefined;
    
    // Add saved status for current user
    const userSavedItems = savedItems.get(req.user.id) || new Set();
    paginatedItems.forEach(item => {
      item.saved = userSavedItems.has(item.id);
    });
    
    res.json({
      items: paginatedItems,
      hasMore,
      nextCursor,
      total: userItems.length
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ message: 'Failed to fetch user items' });
  }
});

// Get saved marketplace items
app.get('/api/marketplace/saved', authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor;
    
    const userSavedItems = savedItems.get(req.user.id) || new Set();
    let savedItemsList = marketplaceItems.filter(item => userSavedItems.has(item.id));
    
    // Sort by most recently saved (for demo, we'll sort by creation date)
    savedItemsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply cursor-based pagination
    if (cursor) {
      const cursorIndex = savedItemsList.findIndex(item => item.id === cursor);
      if (cursorIndex !== -1) {
        savedItemsList = savedItemsList.slice(cursorIndex + 1);
      }
    }
    
    const paginatedItems = savedItemsList.slice(0, limit);
    const hasMore = savedItemsList.length > limit;
    const nextCursor = hasMore ? paginatedItems[paginatedItems.length - 1].id : undefined;
    
    // Mark all as saved
    paginatedItems.forEach(item => {
      item.saved = true;
    });
    
    res.json({
      items: paginatedItems,
      hasMore,
      nextCursor,
      total: savedItemsList.length
    });
  } catch (error) {
    console.error('Get saved items error:', error);
    res.status(500).json({ message: 'Failed to fetch saved items' });
  }
});

// Get similar marketplace items
app.get('/api/marketplace/items/:itemId/similar', authenticateToken, (req, res) => {
  try {
    const { itemId } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    
    const currentItem = marketplaceItems.find(i => i.id === itemId);
    if (!currentItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Find similar items by category and price range
    const priceRange = currentItem.price * 0.3; // 30% price range
    const similarItems = marketplaceItems
      .filter(item => 
        item.id !== itemId &&
        item.status === 'available' &&
        (item.category === currentItem.category ||
         Math.abs(item.price - currentItem.price) <= priceRange)
      )
      .slice(0, limit);
    
    // Add saved status for current user
    const userSavedItems = savedItems.get(req.user.id) || new Set();
    similarItems.forEach(item => {
      item.saved = userSavedItems.has(item.id);
    });
    
    res.json({ items: similarItems });
  } catch (error) {
    console.error('Get similar items error:', error);
    res.status(500).json({ message: 'Failed to fetch similar items' });
  }
});

// Mark item as viewed
app.post('/api/marketplace/items/:itemId/view', authenticateToken, (req, res) => {
  try {
    const { itemId } = req.params;
    const item = marketplaceItems.find(i => i.id === itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    item.views++;
    res.json({ message: 'View recorded' });
  } catch (error) {
    console.error('Mark as viewed error:', error);
    res.status(500).json({ message: 'Failed to record view' });
  }
});

// =================== EVENTS API ===================

// Get all events with filtering and pagination
app.get('/api/events', (req, res) => {
  try {
    const { cursor, limit = 20, category, university, date, status, sortBy } = req.query;
    
    let filteredEvents = [...events];
    
    // Apply filters
    if (category) {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }
    if (university) {
      filteredEvents = filteredEvents.filter(event => event.university === university);
    }
    if (date) {
      filteredEvents = filteredEvents.filter(event => event.date === date);
    }
    if (status) {
      filteredEvents = filteredEvents.filter(event => event.status === status);
    }
    
    // Sort events
    if (sortBy === 'date') {
      filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'popularity') {
      filteredEvents.sort((a, b) => b.attendees - a.attendees);
    } else if (sortBy === 'capacity') {
      filteredEvents.sort((a, b) => b.maxAttendees - a.maxAttendees);
    } else {
      // Default: sort by recent (created date)
      filteredEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Handle pagination
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = filteredEvents.findIndex(event => event.id === cursor);
      startIndex = cursorIndex > -1 ? cursorIndex + 1 : 0;
    }
    
    const limitNum = parseInt(limit);
    const endIndex = startIndex + limitNum;
    const pageEvents = filteredEvents.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredEvents.length;
    const nextCursor = hasMore ? pageEvents[pageEvents.length - 1]?.id : undefined;
    
    // Add user-specific fields
    const userId = req.user?.id;
    const eventsWithUserData = pageEvents.map(event => ({
      ...event,
      isRegistered: userId ? eventRegistrations.get(userId)?.has(event.id) || false : false,
      saved: userId ? savedEvents.get(userId)?.has(event.id) || false : false
    }));
    
    res.json({
      events: eventsWithUserData,
      hasMore,
      nextCursor,
      total: filteredEvents.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Search events
app.get('/api/events/search', (req, res) => {
  try {
    const { q, cursor, limit = 20, category, university, date, status, sortBy } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = q.toLowerCase();
    let filteredEvents = events.filter(event => 
      event.title.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.category.toLowerCase().includes(searchTerm) ||
      event.location.toLowerCase().includes(searchTerm) ||
      event.organizer.name.toLowerCase().includes(searchTerm) ||
      (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
    
    // Apply additional filters
    if (category) {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }
    if (university) {
      filteredEvents = filteredEvents.filter(event => event.university === university);
    }
    if (date) {
      filteredEvents = filteredEvents.filter(event => event.date === date);
    }
    if (status) {
      filteredEvents = filteredEvents.filter(event => event.status === status);
    }
    
    // Sort events
    if (sortBy === 'date') {
      filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'popularity') {
      filteredEvents.sort((a, b) => b.attendees - a.attendees);
    } else if (sortBy === 'capacity') {
      filteredEvents.sort((a, b) => b.maxAttendees - a.maxAttendees);
    } else {
      // Default: sort by recent
      filteredEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Handle pagination
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = filteredEvents.findIndex(event => event.id === cursor);
      startIndex = cursorIndex > -1 ? cursorIndex + 1 : 0;
    }
    
    const limitNum = parseInt(limit);
    const endIndex = startIndex + limitNum;
    const pageEvents = filteredEvents.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredEvents.length;
    const nextCursor = hasMore ? pageEvents[pageEvents.length - 1]?.id : undefined;
    
    // Add user-specific fields
    const userId = req.user?.id;
    const eventsWithUserData = pageEvents.map(event => ({
      ...event,
      isRegistered: userId ? eventRegistrations.get(userId)?.has(event.id) || false : false,
      saved: userId ? savedEvents.get(userId)?.has(event.id) || false : false
    }));
    
    res.json({
      events: eventsWithUserData,
      hasMore,
      nextCursor,
      total: filteredEvents.length
    });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ message: 'Failed to search events' });
  }
});

// Get single event
app.get('/api/events/:id', (req, res) => {
  try {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Add user-specific fields
    const userId = req.user?.id;
    const eventWithUserData = {
      ...event,
      isRegistered: userId ? eventRegistrations.get(userId)?.has(event.id) || false : false,
      saved: userId ? savedEvents.get(userId)?.has(event.id) || false : false
    };
    
    res.json(eventWithUserData);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

// Create new event
app.post('/api/events', authenticateToken, (req, res) => {
  try {
    const { title, description, category, date, startTime, endTime, location, capacity, registrationRequired, tags } = req.body;
    
    if (!title || !description || !category || !date || !startTime || !endTime || !location || capacity === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newEvent = {
      id: eventIdCounter.toString(),
      organizerId: req.user.id,
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      location,
      capacity: parseInt(capacity),
      registrationRequired: registrationRequired === true || registrationRequired === 'true',
      bannerImage: null, // Will be handled separately for file uploads
      organizer: {
        id: req.user.id,
        name: req.user.name,
        username: req.user.email.split('@')[0],
        university: req.user.university,
        avatar: req.user.avatar
      },
      attendees: 0,
      maxAttendees: parseInt(capacity),
      isRegistered: false,
      status: 'upcoming',
      tags: tags || [],
      university: req.user.university,
      views: 0,
      saves: 0,
      saved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    eventIdCounter++;
    
    res.status(201).json({ event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// Update event
app.put('/api/events/:id', authenticateToken, (req, res) => {
  try {
    const eventIndex = events.findIndex(e => e.id === req.params.id);
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[eventIndex];
    
    // Check if user is the organizer
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own events' });
    }
    
    const { title, description, category, date, startTime, endTime, location, capacity, registrationRequired, tags, status } = req.body;
    
    // Update fields
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category = category;
    if (date !== undefined) event.date = date;
    if (startTime !== undefined) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (location !== undefined) event.location = location;
    if (capacity !== undefined) {
      event.capacity = parseInt(capacity);
      event.maxAttendees = parseInt(capacity);
    }
    if (registrationRequired !== undefined) event.registrationRequired = registrationRequired === true || registrationRequired === 'true';
    if (tags !== undefined) event.tags = tags;
    if (status !== undefined) event.status = status;
    
    event.updatedAt = new Date().toISOString();
    
    // Add user-specific fields
    const userId = req.user?.id;
    const eventWithUserData = {
      ...event,
      isRegistered: userId ? eventRegistrations.get(userId)?.has(event.id) || false : false,
      saved: userId ? savedEvents.get(userId)?.has(event.id) || false : false
    };
    
    res.json(eventWithUserData);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// Delete event
app.delete('/api/events/:id', authenticateToken, (req, res) => {
  try {
    const eventIndex = events.findIndex(e => e.id === req.params.id);
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[eventIndex];
    
    // Check if user is the organizer
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own events' });
    }
    
    events.splice(eventIndex, 1);
    
    // Remove from all user registrations and saved events
    for (const [userId, userRegistrations] of eventRegistrations.entries()) {
      userRegistrations.delete(req.params.id);
    }
    for (const [userId, userSavedEvents] of savedEvents.entries()) {
      userSavedEvents.delete(req.params.id);
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// Register for event
app.post('/api/events/:id/register', authenticateToken, (req, res) => {
  try {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!event.registrationRequired) {
      return res.status(400).json({ message: 'This event does not require registration' });
    }
    
    if (event.attendees >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }
    
    const userId = req.user.id;
    
    if (!eventRegistrations.has(userId)) {
      eventRegistrations.set(userId, new Set());
    }
    
    const userRegistrations = eventRegistrations.get(userId);
    
    if (userRegistrations.has(event.id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    userRegistrations.add(event.id);
    event.attendees++;
    
    res.json({
      registered: true,
      attendeesCount: event.attendees
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Failed to register for event' });
  }
});

// Unregister from event
app.post('/api/events/:id/unregister', authenticateToken, (req, res) => {
  try {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const userId = req.user.id;
    const userRegistrations = eventRegistrations.get(userId);
    
    if (!userRegistrations || !userRegistrations.has(event.id)) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }
    
    userRegistrations.delete(event.id);
    event.attendees = Math.max(0, event.attendees - 1);
    
    res.json({
      registered: false,
      attendeesCount: event.attendees
    });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ message: 'Failed to unregister from event' });
  }
});

// Save/unsave event
app.post('/api/events/:id/save', authenticateToken, (req, res) => {
  try {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const userId = req.user.id;
    
    if (!savedEvents.has(userId)) {
      savedEvents.set(userId, new Set());
    }
    
    const userSavedEvents = savedEvents.get(userId);
    const isSaved = userSavedEvents.has(event.id);
    
    if (isSaved) {
      userSavedEvents.delete(event.id);
      event.saves = Math.max(0, event.saves - 1);
    } else {
      userSavedEvents.add(event.id);
      event.saves++;
    }
    
    res.json({
      saved: !isSaved,
      savesCount: event.saves
    });
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ message: 'Failed to save event' });
  }
});

// Mark event as viewed
app.post('/api/events/:id/view', (req, res) => {
  try {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    event.views++;
    res.status(204).send();
  } catch (error) {
    console.error('Error marking event as viewed:', error);
    res.status(500).json({ message: 'Failed to mark event as viewed' });
  }
});

// Get event categories
app.get('/api/events/categories', (req, res) => {
  try {
    const categoryCount = {};
    events.forEach(event => {
      categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
    });
    
    const categories = Object.entries(categoryCount).map(([name, count]) => ({
      id: name.toLowerCase(),
      name,
      count
    }));
    
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    stats: {
      users: users.length,
      posts: posts.length,
      comments: comments.length,
      marketplaceItems: marketplaceItems.length,
      events: events.length
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Oruma Backend Server running on http://localhost:${PORT}`);
  console.log(`📋 Registered users: ${users.length}`);
});