import { useState, useEffect } from 'react';

export const useNavigation = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setCurrentView(hash || 'dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial view

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string) => {
    window.location.hash = view;
    setCurrentView(view);
  };

  return { currentView, navigateTo };
};