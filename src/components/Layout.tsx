import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, LogOut, Settings, User, Calendar, Clock, FolderPlus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  if (!user) return null;

  const getRoleDisplayName = (role: string) => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-900">
                  <a href="#">
                    AGiLe Project Management
                  </a>
                </h1>
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-2 hover:bg-gray-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs">{user.email}</div>
                      <div className="text-xs text-blue-600 capitalize">
                        {getRoleDisplayName(user.role)}
                      </div>
                    </div>
                    <a
                      href="#timeline"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Clock className="h-4 w-4 mr-3" />
                      Sprint Timeline
                    </a>
                    {(user.role === 'admin' || user.role === 'project_manager') && (
                      <>
                        <a
                          href="#admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Admin Panel
                        </a>
                        <a
                          href="#sprints"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Calendar className="h-4 w-4 mr-3" />
                          Sprint Management
                        </a>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <a
                        href="#projects"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FolderPlus className="h-4 w-4 mr-3" />
                        Project Management
                      </a>
                    )}
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;