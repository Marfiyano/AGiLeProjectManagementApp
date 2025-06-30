import React, { useState, useEffect, useRef } from 'react';
import { Story, UpdateStory, User, Attachment, Comment, HistoryEntry } from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { 
  X, 
  Bug, 
  FileText, 
  Loader2, 
  AlertCircle, 
  Save,
  Paperclip,
  Download,
  Trash2,
  MessageSquare,
  Send,
  Edit3,
  Check,
  Image,
  File,
  Clock,
  User as UserIcon,
  Plus
} from 'lucide-react';

interface StoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string | null;
  onStoryUpdated: () => void;
}

const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  isOpen,
  onClose,
  storyId,
  onStoryUpdated
}) => {
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectUsers, setProjectUsers] = useState<User[]>([]);
  const [availableSprints, setAvailableSprints] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UpdateStory>({
    title: '',
    description: '',
    status: 'backlog',
    priority: 'medium',
    assigneeId: '',
    sprint: '',
    estimatedHours: undefined
  });

  useEffect(() => {
    if (isOpen && storyId) {
      loadStory();
      loadProjectUsers();
    }
  }, [isOpen, storyId]);

  const loadStory = async () => {
    if (!storyId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const storyData = await dataService.getStory(storyId);
      if (storyData) {
        setStory(storyData);
        setFormData({
          title: storyData.title,
          description: storyData.description || '',
          status: storyData.status,
          priority: storyData.priority,
          assigneeId: storyData.assigneeId,
          sprint: storyData.sprint,
          estimatedHours: storyData.estimatedHours
        });
      }
    } catch (err) {
      setError('Failed to load story details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectUsers = async () => {
    if (!user) return;
    const users = await dataService.getProjectUsers(user.projectId);
    const sprints = await dataService.getAvailableSprints(user.projectId);
    setProjectUsers(users);
    setAvailableSprints(sprints);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyId || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedStory = await dataService.updateStory(storyId, formData, user.id);
      setStory(updatedStory);
      onStoryUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UpdateStory, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !storyId || !user) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await dataService.addAttachment(storyId, file, user.id);
      }
      await loadStory(); // Refresh to show new attachments
    } catch (err) {
      setError('Failed to upload file(s)');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!storyId) return;

    try {
      await dataService.removeAttachment(storyId, attachmentId);
      await loadStory(); // Refresh to remove attachment
    } catch (err) {
      setError('Failed to remove attachment');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !storyId || !user) return;

    setIsAddingComment(true);
    try {
      await dataService.addComment(storyId, newComment.trim(), user.id);
      setNewComment('');
      await loadStory(); // Refresh to show new comment
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const handleSaveComment = async () => {
    if (!editingCommentId || !storyId) return;

    try {
      await dataService.updateComment(storyId, editingCommentId, editingCommentContent);
      setEditingCommentId(null);
      setEditingCommentContent('');
      await loadStory(); // Refresh to show updated comment
    } catch (err) {
      setError('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!storyId) return;

    try {
      await dataService.deleteComment(storyId, commentId);
      await loadStory(); // Refresh to remove comment
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  const renderAttachment = (attachment: Attachment) => {
    const isImage = attachment.type.startsWith('image/');
    
    return (
      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          {isImage ? (
            <Image className="h-5 w-5 text-blue-500" />
          ) : (
            <File className="h-5 w-5 text-gray-500" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{attachment.name}</div>
            <div className="text-xs text-gray-500">
              {dataService.formatFileSize(attachment.size)} • 
              Uploaded by {dataService.getAssigneeName(attachment.uploadedBy)} • 
              {dataService.formatDate(attachment.uploadedAt)}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isImage && attachment.url !== '#' && (
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="h-8 w-8 object-cover rounded"
            />
          )}
          <button
            onClick={() => window.open(attachment.url, '_blank')}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleRemoveAttachment(attachment.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderComment = (comment: Comment) => {
    const isEditing = editingCommentId === comment.id;
    const isAuthor = user?.id === comment.authorId;
    
    return (
      <div key={comment.id} className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {dataService.getAssigneeName(comment.authorId).charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm">
            <span className="font-medium text-gray-900">
              {dataService.getAssigneeName(comment.authorId)}
            </span>
            <span className="text-gray-500 ml-2">
              {dataService.formatDate(comment.createdAt)}
              {comment.updatedAt && ' (edited)'}
            </span>
          </div>
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editingCommentContent}
                onChange={(e) => setEditingCommentContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveComment}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Check className="h-3 w-3" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setEditingCommentId(null)}
                  className="px-3 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              {isAuthor && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleEditComment(comment)}
                    className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHistoryEntry = (entry: HistoryEntry) => {
    const getActionIcon = (action: string) => {
      switch (action) {
        case 'created':
          return <Plus className="h-4 w-4 text-green-500" />;
        case 'updated':
          return <Edit3 className="h-4 w-4 text-blue-500" />;
        case 'status_changed':
          return <Clock className="h-4 w-4 text-orange-500" />;
        case 'assigned':
          return <UserIcon className="h-4 w-4 text-purple-500" />;
        case 'moved':
          return <Clock className="h-4 w-4 text-indigo-500" />;
        default:
          return <Clock className="h-4 w-4 text-gray-500" />;
      }
    };

    return (
      <div key={entry.id} className="flex space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getActionIcon(entry.action)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">{entry.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            {dataService.formatDate(entry.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : story ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {story.type === 'story' ? (
                      <FileText className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Bug className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{story.id}</h3>
                    <p className="text-sm text-gray-500">
                      Created {dataService.formatDate(story.createdAt)} by {dataService.getAssigneeName(story.createdBy)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status *
                        </label>
                        <select
                          required
                          value={formData.status}
                          onChange={(e) => handleInputChange('status', e.target.value as 'backlog' | 'in progress' | 'done')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="in progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority *
                        </label>
                        <select
                          required
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      {/* Assignee */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assignee *
                        </label>
                        <select
                          required
                          value={formData.assigneeId}
                          onChange={(e) => handleInputChange('assigneeId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {projectUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sprint */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sprint *
                        </label>
                        <select
                          required
                          value={formData.sprint}
                          onChange={(e) => handleInputChange('sprint', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {availableSprints.map(sprint => (
                            <option key={sprint} value={sprint}>{sprint}</option>
                          ))}
                        </select>
                      </div>

                      {/* Estimated Hours */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Hours
                        </label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={formData.estimatedHours || ''}
                          onChange={(e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>

                  {/* Attachments */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900 flex items-center">
                        <Paperclip className="h-5 w-5 mr-2" />
                        Attachments ({story.attachments?.length || 0})
                      </h4>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Paperclip className="h-4 w-4" />
                          )}
                          <span>Add Files</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {story.attachments && story.attachments.length > 0 ? (
                        story.attachments.map(renderAttachment)
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No attachments yet. Click "Add Files" to upload.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments & History Sidebar */}
                <div className="space-y-6">
                  {/* Tab Navigation */}
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveTab('comments')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'comments'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Comments ({story.comments?.length || 0})</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('history')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'history'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>History ({story.history?.length || 0})</span>
                        </div>
                      </button>
                    </nav>
                  </div>

                  {activeTab === 'comments' ? (
                    <div>
                      {/* Add Comment */}
                      <div className="space-y-3 mb-6">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isAddingComment}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {isAddingComment ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          <span>Comment</span>
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {story.comments && story.comments.length > 0 ? (
                          story.comments.map(renderComment)
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No comments yet. Be the first to comment!
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* History List */}
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {story.history && story.history.length > 0 ? (
                          story.history
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map(renderHistoryEntry)
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No history available.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Story not found</h3>
              <p className="mt-1 text-sm text-gray-500">
                The requested story could not be loaded.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryDetailModal;