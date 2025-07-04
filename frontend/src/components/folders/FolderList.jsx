import { Folder, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { folderService } from '../../services/folderService';
import Button from '../common/Button';
import CreateFolderModal from './CreateFolderModal';
import FolderCard from './FolderCard';

const FolderList = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await folderService.getAllFolders();
      if (result.success) {
        setFolders(result.folders);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (folderData) => {
    const result = await folderService.createFolder(folderData);
    if (result.success) {
      setFolders(prev => [...prev, result.folder]);
      setShowCreateModal(false);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadFolders}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Folders</h2>
          <p className="text-gray-600">Organize your study materials</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Folder
        </Button>
      </div>

      {/* Folders Grid */}
      {folders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
          <p className="text-gray-600 mb-4">Create your first folder to get started</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map(folder => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onEdit={() => {/* TODO */}}
              onDelete={() => {/* TODO */}}
            />
          ))}
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <CreateFolderModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateFolder}
        />
      )}
    </div>
  );
};

export default FolderList;