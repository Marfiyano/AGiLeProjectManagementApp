class ApiService {
  private baseURL = 'http://localhost:3001/api';
  private apiKey = 'agile-api-key-2024';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check for new token in response headers
    const newToken = response.headers.get('X-New-Token');
    if (newToken) {
      this.token = newToken;
      localStorage.setItem('auth_token', newToken);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    return response.user;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Projects
  async getProject(projectId: string) {
    return this.request(`/project/${projectId}`);
  }

  async getProjects() {
    return this.request('/projects');
  }

  async createProject(project: { name: string }) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async createUser(user: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUserStatus(userId: string, status: string) {
    return this.request(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getUserProject(userId: string) {
    return this.request(`/user/${userId}/projects`);
  }

  async getProjectUsers(projectId: string) {
    return this.request(`/projects/${projectId}/users`);
  }

  // Stories
  async getStories(projectId: string) {
    return this.request(`/projects/${projectId}/stories`);
  }

  async getStory(storyId: string) {
    return this.request(`/stories/${storyId}`);
  }

  async createStory(projectId: string, story: any) {
    return this.request(`/projects/${projectId}/stories`, {
      method: 'POST',
      body: JSON.stringify(story),
    });
  }

  async updateStory(storyId: string, updates: any) {
    return this.request(`/stories/${storyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Sprints
  async getSprints(projectId: string) {
    return this.request(`/projects/${projectId}/sprints`);
  }

  async createSprint(projectId: string, sprint: any) {
    return this.request(`/projects/${projectId}/sprints`, {
      method: 'POST',
      body: JSON.stringify(sprint),
    });
  }

  async updateSprint(sprintId: string, updates: any) {
    return this.request(`/sprints/${sprintId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getSprintNames(projectId: string) {
    return this.request(`/projects/${projectId}/sprints/names`);
  }

  // Sprint Timeline
  async getSprintAssignments(sprintId: string) {
    return this.request(`/sprints/${sprintId}/assignments`);
  }

  async updateSprintAssignment(sprintId: string, assignment: any) {
    return this.request(`/sprints/${sprintId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  async getSprintDates(sprintId: string) {
    return this.request(`/sprints/${sprintId}/dates`);
  }

  async getSprintTickets(sprintName: string, projectId: string) {
    return this.request(`/sprints/${encodeURIComponent(sprintName)}/tickets/${projectId}`);
  }

  async getSprintSummary(sprintName: string, projectId: string) {
    return this.request(`/sprints/${encodeURIComponent(sprintName)}/summary/${projectId}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();