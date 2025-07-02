export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'tech_lead' | 'personnel';
  status: 'active' | 'inactive';
  projectName?: string;
  projectRole?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt?: string;
  createdBy?: string;
}

export interface UserProject {
  userId: string;
  projectId: string;
  role: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  projectId: string;
}

export interface SprintAssignment {
  id: string;
  sprintId: string;
  userId: string;
  date: string;
  period: 'morning' | 'afternoon';
  ticketId?: string;
  type: 'ticket' | 'VL' | 'SL' | 'unset';
  projectId: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HistoryEntry {
  id: string;
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'moved';
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  timestamp: string;
  description: string;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'in progress' | 'done';
  assigneeId: string;
  projectId: string;
  sprint: string;
  priority: 'low' | 'medium' | 'high';
  type: 'story' | 'bug';
  createdAt: string;
  createdBy: string;
  estimatedHours?: number;
  attachments?: Attachment[];
  comments?: Comment[];
  history?: HistoryEntry[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'tech_lead' | 'personnel';
  projectId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface NewUser {
  name: string;
  email: string;
  projectId: string;
  role: string;
}

export interface NewProject {
  name: string;
}

export interface NewStory {
  title: string;
  description: string;
  type: 'story' | 'bug';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string;
  sprint: string;
  estimatedHours?: number;
  images?: File[];
}

export interface UpdateStory {
  title: string;
  description: string;
  status: 'backlog' | 'in progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string;
  sprint: string;
  estimatedHours?: number;
}

export interface NewSprint {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSprint {
  name: string;
  startDate: string;
  endDate: string;
}