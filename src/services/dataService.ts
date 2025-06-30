import { User, Story, NewUser, NewStory, UpdateStory, Sprint, NewSprint, UpdateSprint, SprintAssignment, Project, NewProject, UserProject } from '../types';
import { apiService } from './apiService';

class DataService {
  // Projects
  async getProject(projectId: string): Promise<Project[]> {
    return apiService.getProject(projectId);
  }

  async getProjects(): Promise<Project[]> {
    return apiService.getProjects();
  }

  async addProject(newProject: NewProject): Promise<Project> {
    return apiService.createProject(newProject);
  }

  // Stories
  async getStories(projectId: string): Promise<Story[]> {
    return apiService.getStories(projectId);
  }

  async getStory(storyId: string): Promise<Story | null> {
    try {
      return await apiService.getStory(storyId);
    } catch (error) {
      return null;
    }
  }

  async updateStory(storyId: string, updates: UpdateStory, userId: string): Promise<Story> {
    return apiService.updateStory(storyId, updates);
  }

  async addStory(newStory: NewStory, projectId: string, userId: string): Promise<Story> {
    return apiService.createStory(projectId, newStory);
  }

  // Users
  async getUsers(): Promise<User[]> {
    return apiService.getUsers();
  }

  async addUser(newUser: NewUser): Promise<User> {
    return apiService.createUser(newUser);
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<void> {
    await apiService.updateUserStatus(userId, status);
  }

  // Sprints
  async getSprints(projectId: string): Promise<Sprint[]> {
    return apiService.getSprints(projectId);
  }

  async addSprint(newSprint: NewSprint, projectId: string): Promise<Sprint> {
    return apiService.createSprint(projectId, newSprint);
  }

  async updateSprint(sprintId: string, updates: UpdateSprint): Promise<Sprint> {
    return apiService.updateSprint(sprintId, updates);
  }

  // Sprint Timeline
  async getSprintAssignments(sprintId: string): Promise<SprintAssignment[]> {
    return apiService.getSprintAssignments(sprintId);
  }

  async updateSprintAssignment(
    sprintId: string,
    userId: string,
    date: string,
    period: 'morning' | 'afternoon',
    assignment: { type: 'ticket' | 'VL' | 'SL' | 'unset'; ticketId?: string },
    projectId: string
  ): Promise<SprintAssignment> {
    return apiService.updateSprintAssignment(sprintId, {
      userId,
      date,
      period,
      type: assignment.type,
      ticketId: assignment.ticketId
    });
  }

  async getUserProject(userId: string): Promise<UserProject[]> {
    return apiService.getUserProject(userId);
  }

  async getProjectUsers(projectId: string): Promise<User[]> {
    return apiService.getProjectUsers(projectId);
  }

  async getAvailableSprints(projectId: string): Promise<string[]> {
    return apiService.getSprintNames(projectId);
  }

  async generateDateRange(startDate: string, endDate: string): Promise<string[]> {
    // This could be moved to backend, but for now we'll keep it client-side
    const dates: string[] = [];
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
  }

  async getAvailableTicketsForSprint(sprintName: string, projectId: string): Promise<Story[]> {
    return apiService.getSprintTickets(sprintName, projectId);
  }

  async getSprintSummary(sprintName: string, projectId: string) {
    return apiService.getSprintSummary(sprintName, projectId);
  }

  // Helper methods (these could be moved to a utils service)
  getAssigneeName(assigneeId: string): string {
    // This would need to be handled differently with the API
    // For now, we'll return the ID and handle name resolution in components
    return assigneeId;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getRoleDisplayName(role: 'admin' | 'project_manager' | 'tech_lead' | 'personnel'): string {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'project_manager':
        return 'Project Manager';
      case 'tech_lead':
        return 'Tech Lead';
      case 'personnel':
        return 'Personnel';
      default:
        return role;
    }
  }

  getCurrentSprint(projectId: string): Promise<Sprint | null> {
    return apiService.getSprints(projectId).then(sprints => {
      return sprints.find(s => s.status === 'active') || 
             sprints.find(s => s.status === 'upcoming') || 
             sprints[0] || null;
    });
  }

  // Placeholder methods for features not yet implemented in API
  async addAttachment(storyId: string, file: File, uploadedBy: string): Promise<any> {
    // TODO: Implement file upload API
    throw new Error('File upload not yet implemented');
  }

  async removeAttachment(storyId: string, attachmentId: string): Promise<void> {
    // TODO: Implement attachment removal API
    throw new Error('Attachment removal not yet implemented');
  }

  async addComment(storyId: string, content: string, authorId: string): Promise<any> {
    // TODO: Implement comments API
    throw new Error('Comments not yet implemented');
  }

  async updateComment(storyId: string, commentId: string, content: string): Promise<any> {
    // TODO: Implement comment update API
    throw new Error('Comment update not yet implemented');
  }

  async deleteComment(storyId: string, commentId: string): Promise<void> {
    // TODO: Implement comment deletion API
    throw new Error('Comment deletion not yet implemented');
  }
}

export const dataService = new DataService();