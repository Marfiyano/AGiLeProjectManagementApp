import { AuthUser, LoginCredentials } from '../types';
import { apiService } from './apiService';

class AuthService {
  private currentUser: AuthUser | null = null;

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const user = await apiService.login(credentials);
      this.currentUser = user;
      return user;
    } catch (error) {
      throw error;
    }
  }

  logout(): void {
    apiService.logout();
    this.currentUser = null;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && localStorage.getItem('auth_token') !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isProjectManager(): boolean {
    return this.currentUser?.role === 'project_manager';
  }

  isTechLead(): boolean {
    return this.currentUser?.role === 'tech_lead';
  }

  isPersonnel(): boolean {
    return this.currentUser?.role === 'personnel';
  }

  canManageUsers(): boolean {
    return this.isAdmin() || this.isProjectManager();
  }

  canManageSprints(): boolean {
    return this.isAdmin() || this.isProjectManager();
  }

  canEditTimeline(): boolean {
    return this.isAdmin() || this.isProjectManager() || this.isTechLead();
  }
}

export const authService = new AuthService();