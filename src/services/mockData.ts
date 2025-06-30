import { User, Project, Story, UserProject, Sprint } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@company.com', role: 'project_manager', status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@company.com', role: 'tech_lead', status: 'active' },
  { id: '3', name: 'Carol Davis', email: 'carol@company.com', role: 'personnel', status: 'active' },
  { id: '4', name: 'David Wilson', email: 'david@company.com', role: 'personnel', status: 'inactive' },
];

export const mockProjects: Project[] = [
  { id: '1', name: 'E-Commerce Platform' },
  { id: '2', name: 'Mobile App' },
  { id: '3', name: 'Analytics Dashboard' },
];

export const mockUserProjects: UserProject[] = [
  { userId: '1', projectId: '1', role: 'Project Manager' },
  { userId: '2', projectId: '1', role: 'Tech Lead' },
  { userId: '3', projectId: '1', role: 'Developer' },
  { userId: '4', projectId: '2', role: 'Developer' },
];

export const mockSprints: Sprint[] = [
  {
    id: '1',
    name: 'Sprint 1',
    startDate: '2024-01-01',
    endDate: '2024-01-14',
    status: 'completed',
    projectId: '1'
  },
  {
    id: '2',
    name: 'Sprint 2',
    startDate: '2024-01-15',
    endDate: '2024-01-28',
    status: 'active',
    projectId: '1'
  },
  {
    id: '3',
    name: 'Sprint 3',
    startDate: '2024-01-29',
    endDate: '2024-02-11',
    status: 'upcoming',
    projectId: '1'
  },
  {
    id: '4',
    name: 'Sprint 4',
    startDate: '2024-02-12',
    endDate: '2024-02-25',
    status: 'upcoming',
    projectId: '1'
  },
  {
    id: '5',
    name: 'Sprint 5',
    startDate: '2024-02-26',
    endDate: '2024-03-11',
    status: 'upcoming',
    projectId: '1'
  }
];

export const mockStories: Story[] = [
  {
    id: 'STORY-001',
    title: 'Implement user authentication system',
    description: 'Create a secure login system with JWT tokens and password hashing. This should include user registration, login, logout, and password reset functionality.',
    status: 'done',
    assigneeId: '2',
    projectId: '1',
    sprint: 'Sprint 1',
    priority: 'high',
    type: 'story',
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: '1',
    estimatedHours: 16,
    attachments: [
      {
        id: 'att-1',
        name: 'auth-wireframes.pdf',
        size: 2048576,
        type: 'application/pdf',
        url: '#',
        uploadedAt: '2024-01-15T11:00:00Z',
        uploadedBy: '3'
      },
      {
        id: 'att-2',
        name: 'login-mockup.png',
        size: 1024000,
        type: 'image/png',
        url: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400',
        uploadedAt: '2024-01-15T12:00:00Z',
        uploadedBy: '3'
      }
    ],
    comments: [
      {
        id: 'comm-1',
        content: 'Started working on the authentication flow. Will implement JWT tokens as discussed.',
        authorId: '2',
        createdAt: '2024-01-15T14:00:00Z'
      },
      {
        id: 'comm-2',
        content: 'Great! Make sure to include proper password validation and rate limiting.',
        authorId: '1',
        createdAt: '2024-01-15T15:30:00Z'
      },
      {
        id: 'comm-3',
        content: 'Authentication system is complete and tested. Ready for review.',
        authorId: '2',
        createdAt: '2024-01-16T09:00:00Z'
      }
    ],
    history: [
      {
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
    ]
  },
  {
    id: 'STORY-002',
    title: 'Design product catalog page',
    description: 'Create responsive design for product listing with filters and search functionality. Should include pagination and sorting options.',
    status: 'in progress',
    assigneeId: '3',
    projectId: '1',
    sprint: 'Sprint 2',
    priority: 'medium',
    type: 'story',
    createdAt: '2024-01-16T09:30:00Z',
    createdBy: '1',
    estimatedHours: 12,
    attachments: [
      {
        id: 'att-3',
        name: 'catalog-design.figma',
        size: 5120000,
        type: 'application/octet-stream',
        url: '#',
        uploadedAt: '2024-01-16T10:00:00Z',
        uploadedBy: '3'
      }
    ],
    comments: [
      {
        id: 'comm-4',
        content: 'Working on the initial designs. Will share the Figma file soon.',
        authorId: '3',
        createdAt: '2024-01-16T10:30:00Z'
      },
      {
        id: 'comm-5',
        content: 'Please ensure the design is mobile-first and accessible.',
        authorId: '1',
        createdAt: '2024-01-16T11:00:00Z'
      }
    ],
    history: [
      {
        id: 'hist-5',
        action: 'created',
        userId: '1',
        timestamp: '2024-01-16T09:30:00Z',
        description: 'Story created by Alice Johnson'
      },
      {
        id: 'hist-6',
        action: 'assigned',
        field: 'assigneeId',
        oldValue: '',
        newValue: '3',
        userId: '1',
        timestamp: '2024-01-16T09:35:00Z',
        description: 'Assigned to Carol Davis by Alice Johnson'
      },
      {
        id: 'hist-7',
        action: 'status_changed',
        field: 'status',
        oldValue: 'backlog',
        newValue: 'in progress',
        userId: '3',
        timestamp: '2024-01-16T10:30:00Z',
        description: 'Status changed from Backlog to In Progress by Carol Davis'
      }
    ]
  },
  {
    id: 'BUG-001',
    title: 'Fix payment gateway timeout issue',
    description: 'Payment processing fails after 30 seconds due to timeout configuration. This affects checkout completion and causes user frustration.',
    status: 'backlog',
    assigneeId: '2',
    projectId: '1',
    sprint: 'Sprint 3',
    priority: 'high',
    type: 'bug',
    createdAt: '2024-01-17T14:15:00Z',
    createdBy: '1',
    estimatedHours: 4,
    attachments: [
      {
        id: 'att-4',
        name: 'error-logs.txt',
        size: 15360,
        type: 'text/plain',
        url: '#',
        uploadedAt: '2024-01-17T14:30:00Z',
        uploadedBy: '1'
      }
    ],
    comments: [
      {
        id: 'comm-6',
        content: 'This is affecting multiple users. Need to prioritize this fix.',
        authorId: '1',
        createdAt: '2024-01-17T14:45:00Z'
      }
    ],
    history: [
      {
        id: 'hist-8',
        action: 'created',
        userId: '1',
        timestamp: '2024-01-17T14:15:00Z',
        description: 'Bug created by Alice Johnson'
      },
      {
        id: 'hist-9',
        action: 'assigned',
        field: 'assigneeId',
        oldValue: '',
        newValue: '2',
        userId: '1',
        timestamp: '2024-01-17T14:20:00Z',
        description: 'Assigned to Bob Smith by Alice Johnson'
      }
    ]
  },
  {
    id: 'STORY-003',
    title: 'Create shopping cart functionality',
    description: 'Implement add to cart, quantity updates, and cart persistence across sessions.',
    status: 'in progress',
    assigneeId: '2',
    projectId: '1',
    sprint: 'Sprint 2',
    priority: 'high',
    type: 'story',
    createdAt: '2024-01-18T11:00:00Z',
    createdBy: '1',
    estimatedHours: 20,
    comments: [
      {
        id: 'comm-7',
        content: 'Started implementing the cart state management.',
        authorId: '2',
        createdAt: '2024-01-18T13:00:00Z'
      }
    ],
    history: [
      {
        id: 'hist-10',
        action: 'created',
        userId: '1',
        timestamp: '2024-01-18T11:00:00Z',
        description: 'Story created by Alice Johnson'
      },
      {
        id: 'hist-11',
        action: 'assigned',
        field: 'assigneeId',
        oldValue: '',
        newValue: '2',
        userId: '1',
        timestamp: '2024-01-18T11:05:00Z',
        description: 'Assigned to Bob Smith by Alice Johnson'
      },
      {
        id: 'hist-12',
        action: 'status_changed',
        field: 'status',
        oldValue: 'backlog',
        newValue: 'in progress',
        userId: '2',
        timestamp: '2024-01-18T13:00:00Z',
        description: 'Status changed from Backlog to In Progress by Bob Smith'
      }
    ]
  },
  {
    id: 'BUG-002',
    title: 'Mobile responsive layout broken on iOS',
    description: 'Product images not displaying correctly on iPhone Safari. Layout breaks on smaller screens.',
    status: 'backlog',
    assigneeId: '3',
    projectId: '1',
    sprint: 'Sprint 3',
    priority: 'medium',
    type: 'bug',
    createdAt: '2024-01-19T16:45:00Z',
    createdBy: '2',
    estimatedHours: 6,
    attachments: [
      {
        id: 'att-5',
        name: 'ios-screenshot.png',
        size: 890000,
        type: 'image/png',
        url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg?auto=compress&cs=tinysrgb&w=400',
        uploadedAt: '2024-01-19T17:00:00Z',
        uploadedBy: '1'
      }
    ],
    comments: [],
    history: [
      {
        id: 'hist-13',
        action: 'created',
        userId: '2',
        timestamp: '2024-01-19T16:45:00Z',
        description: 'Bug created by Bob Smith'
      },
      {
        id: 'hist-14',
        action: 'assigned',
        field: 'assigneeId',
        oldValue: '',
        newValue: '3',
        userId: '2',
        timestamp: '2024-01-19T16:50:00Z',
        description: 'Assigned to Carol Davis by Bob Smith'
      }
    ]
  }
];