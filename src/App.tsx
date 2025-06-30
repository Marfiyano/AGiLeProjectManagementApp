import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useNavigation } from './hooks/useNavigation';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import SprintManagement from './components/SprintManagement';
import SprintTimeline from './components/SprintTimeline';
import ProjectManagement from './components/ProjectManagement';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { currentView } = useNavigation();

  if (!user) {
    return <LoginForm />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'admin':
        return (
          <ProtectedRoute requireProjectManager>
            <AdminPanel />
          </ProtectedRoute>
        );
      case 'sprints':
        return (
          <ProtectedRoute requireProjectManager>
            <SprintManagement />
          </ProtectedRoute>
        );
      case 'projects':
        return (
          <ProtectedRoute requireAdmin>
            <ProjectManagement />
          </ProtectedRoute>
        );
      case 'timeline':
        return <SprintTimeline />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderCurrentView()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;