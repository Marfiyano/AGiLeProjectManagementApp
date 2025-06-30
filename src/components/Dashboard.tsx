import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { Story } from '../types';
import AddStoryModal from './AddStoryModal';
import StoryDetailModal from './StoryDetailModal';
import { Search, Clock, AlertCircle, Plus, Bug, FileText, Paperclip, MessageSquare } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSprint, setSelectedSprint] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [availableSprints, setAvailableSprints] = useState<string[]>([]);
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadStories();
  }, [user]);

  const loadStories = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [storiesData, sprintsData, usersData] = await Promise.all([
        dataService.getStories(user.projectId),
        dataService.getAvailableSprints(user.projectId),
        dataService.getProjectUsers(user.projectId)
      ]);
      
      setStories(storiesData);
      setFilteredStories(storiesData);
      setAvailableSprints(sprintsData);
      
      // Create user names mapping
      const namesMap: {[key: string]: string} = {};
      usersData.forEach(u => {
        namesMap[u.id] = u.name;
      });
      setUserNames(namesMap);

      // Set current sprint as default
      const currentSprint = await dataService.getCurrentSprint(user.projectId);
      if (currentSprint) {
        setSelectedSprint(currentSprint.name);
      }
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = stories;

    if (searchTerm) {
      filtered = filtered.filter(story => 
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSprint) {
      filtered = filtered.filter(story => story.sprint === selectedSprint);
    }

    if (selectedStatus) {
      filtered = filtered.filter(story => story.status === selectedStatus);
    }

    if (selectedPriority) {
      filtered = filtered.filter(story => story.priority === selectedPriority);
    }

    if (selectedType) {
      filtered = filtered.filter(story => story.type === selectedType);
    }

    setFilteredStories(filtered);
  }, [stories, searchTerm, selectedSprint, selectedStatus, selectedPriority, selectedType]);

  const getStatusBadge = (status: Story['status']) => {
    const styles = {
      backlog: 'bg-gray-100 text-gray-800',
      'in progress': 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: Story['priority']) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const getTypeBadge = (type: Story['type']) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        type === 'story' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {type === 'story' ? (
          <FileText className="h-3 w-3 mr-1" />
        ) : (
          <Bug className="h-3 w-3 mr-1" />
        )}
        {type}
      </span>
    );
  };

  const uniqueStatuses = Array.from(new Set(stories.map(story => story.status)));
  const uniquePriorities = Array.from(new Set(stories.map(story => story.priority)));
  const uniqueTypes = Array.from(new Set(stories.map(story => story.type)));

  const handleStoryAdded = () => {
    loadStories();
  };

  const handleStoryClick = (storyId: string) => {
    setSelectedStoryId(storyId);
  };

  const handleStoryUpdated = () => {
    loadStories();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{filteredStories.length} of {stories.length} items</span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Story</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Stories
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sprint
            </label>
            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Sprints</option>
              {availableSprints.map(sprint => (
                <option key={sprint} value={sprint}>{sprint}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              {uniquePriorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID / Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sprint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No stories found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search criteria or create a new story.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStories.map((story) => (
                  <tr 
                    key={story.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleStoryClick(story.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{story.id}</div>
                        {getTypeBadge(story.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{story.title}</div>
                        {story.description && (
                          <div className="text-gray-500 text-xs mt-1 truncate">
                            {story.description}
                          </div>
                        )}
                        {story.attachments && story.attachments.length > 0 && (
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <Paperclip className="h-3 w-3 mr-1" />
                            {story.attachments.length} attachment{story.attachments.length !== 1 ? 's' : ''}
                          </div>
                        )}
                        {story.comments && story.comments.length > 0 && (
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {story.comments.length} comment{story.comments.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(story.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userNames[story.assigneeId] || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {story.sprint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(story.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {story.estimatedHours ? `${story.estimatedHours}h` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddStoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStoryAdded={handleStoryAdded}
        projectId={user?.projectId || '1'}
      />

      <StoryDetailModal
        isOpen={!!selectedStoryId}
        onClose={() => setSelectedStoryId(null)}
        storyId={selectedStoryId}
        onStoryUpdated={handleStoryUpdated}
      />
    </div>
  );
};

export default Dashboard;