import React, { useState, useEffect } from 'react';
import { Sprint, NewSprint, UpdateSprint } from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Plus, AlertCircle, CheckCircle, XCircle, Loader2, Edit3, Save, X } from 'lucide-react';

const SprintManagement: React.FC = () => {
  const { user } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingSprint, setEditingSprint] = useState<string | null>(null);
  const [newSprint, setNewSprint] = useState<NewSprint>({
    name: '',
    startDate: '',
    endDate: ''
  });
  const [editFormData, setEditFormData] = useState<UpdateSprint>({
    name: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (user) {
      loadSprints();
    }
  }, [user]);

  const loadSprints = async () => {
    if (!user) return;
    
    try {
      const sprintsData = await dataService.getSprints(user.projectId);
      setSprints(sprintsData);
    } catch (error) {
      setError('Failed to load sprints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await dataService.addSprint(newSprint, user.projectId);
      setSuccess('Sprint added successfully!');
      setNewSprint({ name: '', startDate: '', endDate: '' });
      setShowAddForm(false);
      await loadSprints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add sprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint.id);
    setEditFormData({
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate
    });
  };

  const handleSaveEdit = async (sprintId: string) => {
    setError(null);
    setSuccess(null);

    try {
      await dataService.updateSprint(sprintId, editFormData);
      setSuccess('Sprint updated successfully!');
      setEditingSprint(null);
      await loadSprints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sprint');
    }
  };

  const handleCancelEdit = () => {
    setEditingSprint(null);
    setEditFormData({ name: '', startDate: '', endDate: '' });
  };

  const getStatusBadge = (status: Sprint['status']) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isUpcoming = (sprint: Sprint) => sprint.status === 'upcoming';

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
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">Sprint Management</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Sprint</span>
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto -mx-1.5 -my-1.5 text-red-400 hover:text-red-500"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto -mx-1.5 -my-1.5 text-green-400 hover:text-green-500"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Add Sprint Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Sprint</h2>
          <form onSubmit={handleAddSprint} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                required
                value={newSprint.startDate}
                onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                required
                value={newSprint.endDate}
                onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>Add Sprint</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sprints Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sprint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sprints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No sprints found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating your first sprint.
                    </p>
                  </td>
                </tr>
              ) : (
                sprints.map((sprint) => (
                  <tr key={sprint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSprint === sprint.id ? (
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{sprint.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSprint === sprint.id ? (
                        <input
                          type="date"
                          value={editFormData.startDate}
                          onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{formatDate(sprint.startDate)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSprint === sprint.id ? (
                        <input
                          type="date"
                          value={editFormData.endDate}
                          onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{formatDate(sprint.endDate)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.ceil((new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(sprint.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingSprint === sprint.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(sprint.id)}
                            className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            <Save className="h-3 w-3" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            <X className="h-3 w-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditSprint(sprint)}
                          disabled={!isUpcoming(sprint)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                            isUpcoming(sprint)
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>* Only upcoming sprints can be modified</p>
      </div>
    </div>
  );
};

export default SprintManagement;