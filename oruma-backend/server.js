const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key-here'; // In production, use environment variable

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const users = [];
const posts = [];
const comments = [];
let userIdCounter = 1;
let postIdCounter = 1;
let commentIdCounter = 1;

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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    stats: {
      users: users.length,
      posts: posts.length,
      comments: comments.length
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Oruma Backend Server running on http://localhost:${PORT}`);
  console.log(`📋 Registered users: ${users.length}`);
});