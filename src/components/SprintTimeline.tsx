import React, { useState, useEffect } from 'react';
import { Sprint, User, Story, SprintAssignment } from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, ChevronDown, Clock, Users, Edit3, Check, X } from 'lucide-react';

const SprintTimeline: React.FC = () => {
  const { user } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [projectUsers, setProjectUsers] = useState<User[]>([]);
  const [sprintDates, setSprintDates] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<SprintAssignment[]>([]);
  const [availableTickets, setAvailableTickets] = useState<Story[]>([]);
  const [sprintSummary, setSprintSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});

  const canEdit = user?.role === 'admin' || user?.role === 'project_manager' || user?.role === 'tech_lead';

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSprint) {
      loadSprintData();
    }
  }, [selectedSprint]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [sprintsData, usersData] = await Promise.all([
        dataService.getSprints(user.projectId),
        dataService.getProjectUsers(user.projectId)
      ]);

      setSprints(sprintsData);
      setProjectUsers(usersData);

      // Create user names mapping
      const namesMap: {[key: string]: string} = {};
      usersData.forEach(u => {
        namesMap[u.id] = u.name;
      });
      setUserNames(namesMap);

      // Select current sprint by default
      const currentSprint = await dataService.getCurrentSprint(user.projectId);
      if (currentSprint) {
        setSelectedSprint(currentSprint);
      } else if (sprintsData.length > 0) {
        setSelectedSprint(sprintsData[0]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSprintData = async () => {
    if (!selectedSprint || !user) return;

    try {
      const [assignmentsData, ticketsData, summaryData] = await Promise.all([
        dataService.getSprintAssignments(selectedSprint.id),
        dataService.getAvailableTicketsForSprint(selectedSprint.name, user.projectId),
        dataService.getSprintSummary(selectedSprint.name, user.projectId)
      ]);

      setAssignments(assignmentsData);
      setAvailableTickets(ticketsData);
      setSprintSummary(summaryData);
      
      const dates = await dataService.generateDateRange(selectedSprint.startDate, selectedSprint.endDate);
      setSprintDates(dates);
    } catch (error) {
      console.error('Failed to load sprint data:', error);
    }
  };

  const getAssignment = (userId: string, date: string, period: 'morning' | 'afternoon'): SprintAssignment | null => {
    return assignments.find(a => 
      a.userId === userId && a.date === date && a.period === period
    ) || null;
  };

  const handleAssignmentChange = async (
    userId: string, 
    date: string, 
    period: 'morning' | 'afternoon', 
    value: string
  ) => {
    if (!selectedSprint || !user || !canEdit) return;

    let assignment: { type: 'ticket' | 'VL' | 'SL' | 'unset'; ticketId?: string };

    if (value === 'VL') {
      assignment = { type: 'VL' };
    } else if (value === 'SL') {
      assignment = { type: 'SL' };
    } else if (value === '') {
      assignment = { type: 'unset' };
    } else {
      assignment = { type: 'ticket', ticketId: value };
    }

    try {
      await dataService.updateSprintAssignment(
        selectedSprint.id,
        userId,
        date,
        period,
        assignment,
        user.projectId
      );
      
      await loadSprintData();
    } catch (error) {
      console.error('Failed to update assignment:', error);
    }
  };

  const getAvailableTicketsForDropdown = (userId: string) => {
    if (!selectedSprint) return [];
    return availableTickets.filter(ticket => ticket.assigneeId === userId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return { day, month, weekday };
  };

  const getAssignmentDisplay = (assignment: SprintAssignment | null) => {
    if (!assignment) return '';
    
    switch (assignment.type) {
      case 'VL':
        return 'VL';
      case 'SL':
        return 'SL';
      case 'ticket':
        if (assignment.ticketId) {
          const ticket = availableTickets.find(t => t.id === assignment.ticketId);
          return ticket ? `${ticket.id} (${ticket.estimatedHours}h)` : assignment.ticketId;
        }
        return '';
      default:
        return '';
    }
  };

  const formatSprintDateRange = (sprint: Sprint) => {
    const startDate = new Date(sprint.startDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    const endDate = new Date(sprint.endDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    return `${startDate} - ${endDate}`;
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
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">Sprint Timeline</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {canEdit && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                editMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {editMode ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              <span>{editMode ? 'Save' : 'Edit'}</span>
            </button>
          )}
          
          <div className="relative">
            <select
              value={selectedSprint?.id || ''}
              onChange={(e) => {
                const sprint = sprints.find(s => s.id === e.target.value);
                setSelectedSprint(sprint || null);
              }}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sprints.map(sprint => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} ({formatSprintDateRange(sprint)})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {selectedSprint && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sprintSummary && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sprint Summary</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{sprintSummary.totalTickets}</div>
                    <div className="text-sm text-gray-500">Total Tickets</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-600">{sprintSummary.statusCounts.backlog}</div>
                    <div className="text-xs text-gray-500">Backlog</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">{sprintSummary.statusCounts['in progress']}</div>
                    <div className="text-xs text-gray-500">In Progress</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">{sprintSummary.statusCounts.done}</div>
                    <div className="text-xs text-gray-500">Done</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
              <div className="grid grid-cols-4 gap-2">
                {projectUsers.map(member => (
                  <div key={member.id} className="text-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-1">
                      <span className="text-xs font-medium text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-900 truncate">{member.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Team Member
                    </th>
                    {sprintDates.map(date => {
                      const { day, month, weekday } = formatDate(date);
                      return (
                        <th key={date} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[120px]">
                          <div className="space-y-1">
                            <div className="font-semibold">{weekday}</div>
                            <div>{month} {day}</div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projectUsers.map(member => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white px-6 py-4 border-r border-gray-200" rowSpan={1}>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </div>
                      </td>
                      {sprintDates.map(date => {
                        const morningAssignment = getAssignment(member.id, date, 'morning');
                        const afternoonAssignment = getAssignment(member.id, date, 'afternoon');
                        const availableTickets = getAvailableTicketsForDropdown(member.id);
                        
                        return (
                          <td key={date} className="px-3 py-2 border-r border-gray-200">
                            <div className="space-y-1">
                              {/* Morning */}
                              <div className="text-xs">
                                {editMode && canEdit ? (
                                  <select
                                    value={morningAssignment?.type === 'ticket' ? morningAssignment.ticketId || '' : morningAssignment?.type || ''}
                                    onChange={(e) => handleAssignmentChange(member.id, date, 'morning', e.target.value)}
                                    className="w-full text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="">-</option>
                                    <option value="VL">VL</option>
                                    <option value="SL">SL</option>
                                    {availableTickets.map(ticket => (
                                      <option key={ticket.id} value={ticket.id}>
                                        {ticket.id} ({ticket.estimatedHours}h)
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="text-center py-0.5 text-gray-600">
                                    {getAssignmentDisplay(morningAssignment) || '-'}
                                  </div>
                                )}
                              </div>
                              
                              {/* Afternoon */}
                              <div className="text-xs">
                                {editMode && canEdit ? (
                                  <select
                                    value={afternoonAssignment?.type === 'ticket' ? afternoonAssignment.ticketId || '' : afternoonAssignment?.type || ''}
                                    onChange={(e) => handleAssignmentChange(member.id, date, 'afternoon', e.target.value)}
                                    className="w-full text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="">-</option>
                                    <option value="VL">VL</option>
                                    <option value="SL">SL</option>
                                    {availableTickets.map(ticket => (
                                      <option key={ticket.id} value={ticket.id}>
                                        {ticket.id} ({ticket.estimatedHours}h)
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="text-center py-0.5 text-gray-600">
                                    {getAssignmentDisplay(afternoonAssignment) || '-'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!canEdit && (
            <div className="text-center text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              You have view-only access. Only Admins, Project Managers and Tech Leads can modify assignments.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SprintTimeline;