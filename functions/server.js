// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const { v4: uuidv4 } = require('uuid');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jsonwebtoken from 'jsonwebtoken';
const jwt = jsonwebtoken;
import bcrypt from 'bcryptjs';
import { v4 } from 'uuid';
const uuidv4 = v4;

const app = express();
const PORT = process.env.PORT || 3001;

// Security configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const API_KEY = process.env.API_KEY || 'marfiyanoprojman-api-key-2024';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://marfiyanoprojman.netlify.app'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));

// API Key middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Renew token expiration
    const newToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        projectId: user.projectId 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.setHeader('X-New-Token', newToken);
    req.user = user;
    next();
  });
};

// In-memory database (replace with real database in production)
let database = {
  users: [
    { id: '1', name: 'Alice Johnson', email: 'alice@company.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'admin', status: 'active' },
    { id: '2', name: 'Bob Smith', email: 'bob@company.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'project_manager', status: 'active' },
    { id: '3', name: 'Carol Davis', email: 'carol@company.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'tech_lead', status: 'active' },
    { id: '4', name: 'David Wilson', email: 'david@company.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'personnel', status: 'inactive' },
  ],
  projects: [
    { id: '1', name: 'E-Commerce Platform', createdAt: '2024-01-01T00:00:00Z', createdBy: '1' },
    { id: '2', name: 'Mobile App', createdAt: '2024-01-01T00:00:00Z', createdBy: '1' },
    { id: '3', name: 'Analytics Dashboard', createdAt: '2024-01-01T00:00:00Z', createdBy: '1' },
  ],
  userProjects: [
    { userId: '1', projectId: '1', role: 'Admin' },
    { userId: '2', projectId: '1', role: 'Project Manager' },
    { userId: '3', projectId: '1', role: 'Tech Lead' },
    { userId: '4', projectId: '2', role: 'Developer' },
  ],
  sprints: [
    { id: '1', name: 'Sprint 1', startDate: '2024-01-01', endDate: '2024-01-14', status: 'completed', projectId: '1' },
    { id: '2', name: 'Sprint 2', startDate: '2024-01-15', endDate: '2024-01-28', status: 'active', projectId: '1' },
    { id: '3', name: 'Sprint 3', startDate: '2024-01-29', endDate: '2024-02-11', status: 'upcoming', projectId: '1' },
    { id: '4', name: 'Sprint 4', startDate: '2024-02-12', endDate: '2024-02-25', status: 'upcoming', projectId: '1' },
    { id: '5', name: 'Sprint 5', startDate: '2024-02-26', endDate: '2024-03-11', status: 'upcoming', projectId: '1' },
  ],
  stories: [
    {
      id: 'STORY-001',
      title: 'Implement user authentication system',
      description: 'Create a secure login system with JWT tokens and password hashing.',
      status: 'done',
      assigneeId: '3',
      projectId: '1',
      sprint: 'Sprint 1',
      priority: 'high',
      type: 'story',
      createdAt: '2024-01-15T10:00:00Z',
      createdBy: '1',
      estimatedHours: 16,
      attachments: [],
      comments: [],
      history: []
      },
    {
      id: 'STORY-002',
      title: 'Design product catalog page',
      description: 'Create responsive design for product listing with filters.',
      status: 'in progress',
      assigneeId: '3',
      projectId: '1',
      sprint: 'Sprint 2',
      priority: 'medium',
      type: 'story',
      createdAt: '2024-01-16T09:30:00Z',
      createdBy: '1',
      estimatedHours: 12,
      attachments: [],
      comments: [],
      history: [{
        id: 'hist-1',
        action: 'created',
        userId: '1',
        timestamp: '2024-01-15T10:00:00Z',
        description: 'Story created by Alice Johnson'
      },
      {
        id: 'hist-2',
        action: 'assigned',
        field: 'assigneeId',
        oldValue: '',
        newValue: '2',
        userId: '1',
        timestamp: '2024-01-15T10:05:00Z',
        description: 'Assigned to Bob Smith by Alice Johnson'
      },
      {
        id: 'hist-3',
        action: 'status_changed',
        field: 'status',
        oldValue: 'backlog',
        newValue: 'in progress',
        userId: '2',
        timestamp: '2024-01-15T14:00:00Z',
        description: 'Status changed from Backlog to In Progress by Bob Smith'
      },
      {
        id: 'hist-4',
        action: 'status_changed',
        field: 'status',
        oldValue: 'in progress',
        newValue: 'done',
        userId: '2',
        timestamp: '2024-01-16T09:00:00Z',
        description: 'Status changed from In Progress to Done by Bob Smith'
      }
    ]},
    {
      id: 'BUG-001',
      title: 'Fix payment gateway timeout issue',
      description: 'Payment processing fails after 30 seconds.',
      status: 'backlog',
      assigneeId: '2',
      projectId: '1',
      sprint: 'Sprint 3',
      priority: 'high',
      type: 'bug',
      createdAt: '2024-01-17T14:15:00Z',
      createdBy: '1',
      estimatedHours: 4,
      attachments: [],
      comments: [],
      history: []
    },
    {
      id: 'STORY-003',
      title: 'Create shopping cart functionality',
      description: 'Implement add to cart, quantity updates, and cart persistence.',
      status: 'in progress',
      assigneeId: '2',
      projectId: '1',
      sprint: 'Sprint 2',
      priority: 'high',
      type: 'story',
      createdAt: '2024-01-18T11:00:00Z',
      createdBy: '1',
      estimatedHours: 20,
      attachments: [],
      comments: [],
      history: []
    }
  ],
  sprintAssignments: []
};

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      projectId: getUserProject(user.id)?.projectId || '1'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const getUserProject = (userId) => {
  return database.userProjects.find(up => up.userId === userId);
};

const getProjectUsers = (projectId) => {
  const projectUserIds = database.userProjects
    .filter(up => up.projectId === projectId)
    .map(up => up.userId);
  
  return database.users.filter(user => 
    projectUserIds.includes(user.id) && user.status === 'active'
  );
};

const generateDateRange = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  return dates;
};

// Routes

// Authentication
app.post('/api/auth/login', validateApiKey, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = database.users.find(u => u.email === email && u.status === 'active');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    // In production, use bcrypt.compare(password, user.password)
    // For demo, we'll accept 'password' as valid
    if (password !== 'password') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userProject = getUserProject(user.id);
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        projectId: userProject?.projectId || '1'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Projects
app.get('/api/project/:id', validateApiKey, authenticateToken, (req, res) => {
  res.json(database.projects.find(p => p.id === req.params.id));
});

app.get('/api/projects', validateApiKey, authenticateToken, (req, res) => {
  res.json(database.projects);
});

app.post('/api/projects', validateApiKey, authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can create projects' });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const project = {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    createdBy: req.user.id
  };

  database.projects.push(project);
  res.status(201).json(project);
});

// Users
app.get('/api/users', validateApiKey, authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const usersWithProjects = database.users.map(user => {
    const userProject = getUserProject(user.id);
    const project = database.projects.find(p => p.id === userProject?.projectId);
    return {
      ...user,
      password: undefined, // Don't send password
      projectName: project?.name,
      projectRole: userProject?.role
    };
  });
  
  res.json(usersWithProjects);
});

app.post('/api/users', validateApiKey, authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { name, email, projectId, role } = req.body;
  
  // Check if user already exists
  const existingUser = database.users.find(u => u.email === email);
  if (existingUser) {
    const existingUserProject = database.userProjects.find(
      up => up.userId === existingUser.id && up.projectId === projectId
    );
    if (existingUserProject) {
      return res.status(400).json({ error: 'User already exists in this project' });
    }
  }

  const user = {
    id: uuidv4(),
    name,
    email,
    password: await bcrypt.hash('password', 10), // Default password
    role: 'personnel',
    status: 'active'
  };

  database.users.push(user);
  database.userProjects.push({
    userId: user.id,
    projectId,
    role
  });

  res.status(201).json({ ...user, password: undefined });
});

app.get('/api/user/:id/projects', validateApiKey, authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const userProject = getUserProject(req.params.id);

  if (!userProject) {
    return res.status(404).json({ error: 'User has no project' });
  }
  
  res.json(userProject);
});

app.patch('/api/users/:id/status', validateApiKey, authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { status } = req.body;
  const user = database.users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.status = status;
  res.json({ ...user, password: undefined });
});

// Stories
app.get('/api/projects/:projectId/stories', validateApiKey, authenticateToken, (req, res) => {
  const stories = database.stories.filter(story => story.projectId === req.params.projectId);
  res.json(stories);
});

app.get('/api/stories/:id', validateApiKey, authenticateToken, (req, res) => {
  const story = database.stories.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }
  res.json(story);
});

app.post('/api/projects/:projectId/stories', validateApiKey, authenticateToken, (req, res) => {
  const { title, description, type, priority, assigneeId, sprint, estimatedHours } = req.body;
  
  // Generate ID
  const typePrefix = type === 'story' ? 'STORY' : 'BUG';
  const existingIds = database.stories
    .filter(s => s.id.startsWith(typePrefix))
    .map(s => parseInt(s.id.split('-')[1]))
    .filter(n => !isNaN(n));
  
  const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  const storyId = `${typePrefix}-${nextNumber.toString().padStart(3, '0')}`;

  const story = {
    id: storyId,
    title,
    description,
    status: 'backlog',
    assigneeId,
    projectId: req.params.projectId,
    sprint,
    priority,
    type,
    createdAt: new Date().toISOString(),
    createdBy: req.user.id,
    estimatedHours,
    attachments: [],
    comments: [],
    history: [{
      id: uuidv4(),
      action: 'created',
      userId: req.user.id,
      timestamp: new Date().toISOString(),
      description: `${type === 'story' ? 'Story' : 'Bug'} created by ${req.user.name || 'User'}`
    }]
  };

  database.stories.push(story);
  res.status(201).json(story);
});

app.patch('/api/stories/:id', validateApiKey, authenticateToken, (req, res) => {
  const storyIndex = database.stories.findIndex(s => s.id === req.params.id);
  if (storyIndex === -1) {
    return res.status(404).json({ error: 'Story not found' });
  }

  const oldStory = { ...database.stories[storyIndex] };
  const updates = req.body;
  
  database.stories[storyIndex] = {
    ...database.stories[storyIndex],
    ...updates
  };

  // Add history entries for changes
  const historyEntries = [];
  const timestamp = new Date().toISOString();

  Object.keys(updates).forEach(field => {
    if (oldStory[field] !== updates[field] && field !== 'history') {
      historyEntries.push({
        id: uuidv4(),
        action: field === 'status' ? 'status_changed' : 'updated',
        field,
        oldValue: oldStory[field],
        newValue: updates[field],
        userId: req.user.id,
        timestamp,
        description: `${field} changed from ${oldStory[field]} to ${updates[field]} by ${req.user.name || 'User'}`
      });
    }
  });

  if (historyEntries.length > 0) {
    database.stories[storyIndex].history = [
      ...(database.stories[storyIndex].history || []),
      ...historyEntries
    ];
  }

  res.json(database.stories[storyIndex]);
});

// Sprints
app.get('/api/projects/:projectId/sprints', validateApiKey, authenticateToken, (req, res) => {
  const sprints = database.sprints.filter(sprint => sprint.projectId === req.params.projectId);
  res.json(sprints);
});

app.post('/api/projects/:projectId/sprints', validateApiKey, authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { startDate, endDate } = req.body;
  
  // Generate sprint number
  const existingSprints = database.sprints.filter(s => s.projectId === req.params.projectId);
  const sprintNumbers = existingSprints
    .map(s => parseInt(s.name.replace('Sprint ', '')))
    .filter(n => !isNaN(n));
  
  const nextNumber = sprintNumbers.length > 0 ? Math.max(...sprintNumbers) + 1 : 1;

  const sprint = {
    id: uuidv4(),
    name: `Sprint ${nextNumber}`,
    startDate,
    endDate,
    status: 'upcoming',
    projectId: req.params.projectId
  };

  database.sprints.push(sprint);
  res.status(201).json(sprint);
});

app.patch('/api/sprints/:id', validateApiKey, authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const sprintIndex = database.sprints.findIndex(s => s.id === req.params.id);
  if (sprintIndex === -1) {
    return res.status(404).json({ error: 'Sprint not found' });
  }

  if (database.sprints[sprintIndex].status !== 'upcoming') {
    return res.status(400).json({ error: 'Can only modify upcoming sprints' });
  }

  database.sprints[sprintIndex] = {
    ...database.sprints[sprintIndex],
    ...req.body
  };

  res.json(database.sprints[sprintIndex]);
});

// Sprint Timeline
app.get('/api/sprints/:sprintId/assignments', validateApiKey, authenticateToken, (req, res) => {
  const assignments = database.sprintAssignments.filter(a => a.sprintId === req.params.sprintId);
  res.json(assignments);
});

app.post('/api/sprints/:sprintId/assignments', validateApiKey, authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'project_manager' && req.user.role !== 'tech_lead') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { userId, date, period, type, ticketId } = req.body;
  console.log('BE req.body', userId, date, period, type, ticketId);
  
  const existingIndex = database.sprintAssignments.findIndex(
    a => a.sprintId === req.params.sprintId && a.userId === userId && a.date === date && a.period === period
  );

  const assignment = {
    id: existingIndex >= 0 ? database.sprintAssignments[existingIndex].id : uuidv4(),
    sprintId: req.params.sprintId,
    userId,
    date,
    period,
    type,
    ticketId,
    projectId: req.user.projectId
  };

  if (existingIndex >= 0) {
    database.sprintAssignments[existingIndex] = assignment;
  } else {
    database.sprintAssignments.push(assignment);
  }

  res.json(assignment);
});

// Helper endpoints
app.get('/api/projects/:projectId/users', validateApiKey, authenticateToken, (req, res) => {
  const users = getProjectUsers(req.params.projectId);
  res.json(users.map(u => ({ ...u, password: undefined })));
});

app.get('/api/projects/:projectId/sprints/names', validateApiKey, authenticateToken, (req, res) => {
  const sprints = database.sprints
    .filter(sprint => sprint.projectId === req.params.projectId)
    .map(sprint => sprint.name);
  res.json(sprints);
});

app.get('/api/sprints/:sprintId/dates', validateApiKey, authenticateToken, (req, res) => {
  const sprint = database.sprints.find(s => s.id === req.params.sprintId);
  if (!sprint) {
    return res.status(404).json({ error: 'Sprint not found' });
  }
  
  const dates = generateDateRange(sprint.startDate, sprint.endDate);
  res.json(dates);
});

app.get('/api/sprints/:sprintName/tickets/:projectId', validateApiKey, authenticateToken, (req, res) => {
  const tickets = database.stories.filter(story => 
    story.projectId === req.params.projectId && 
    story.sprint === req.params.sprintName &&
    story.estimatedHours && 
    story.estimatedHours > 0
  );
  res.json(tickets);
});

app.get('/api/sprints/:sprintName/summary/:projectId', validateApiKey, authenticateToken, (req, res) => {
  const sprintStories = database.stories.filter(story => 
    story.projectId === req.params.projectId && story.sprint === req.params.sprintName
  );

  const summary = {
    totalTickets: sprintStories.length,
    statusCounts: {
      backlog: sprintStories.filter(s => s.status === 'backlog').length,
      'in progress': sprintStories.filter(s => s.status === 'in progress').length,
      done: sprintStories.filter(s => s.status === 'done').length
    }
  };

  res.json(summary);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});