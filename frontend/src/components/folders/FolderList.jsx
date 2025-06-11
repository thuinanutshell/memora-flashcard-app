// src/components/folders/FolderList.jsx
import { useEffect, useState } from 'react';
import useFolders from '../../hooks/useFolders';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import CreateFolderModal from './CreateFolderModal';
import EditFolderModal from './EditFolderModal';
import FolderCard from './FolderCard';

const FolderList = () => {
  const { 
    folders, 
    loading, 
    error, 
    fetchFolders, 
    createFolder, 
    updateFolder, 
    deleteFolder,
    clearError 
  } = useFolders();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleCreateFolder = async (folderData) => {
    try {
      await createFolder(folderData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Create folder error:', error);
    }
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setShowEditModal(true);
  };

  const handleUpdateFolder = async (folderData) => {
    try {
      await updateFolder(editingFolder.id, folderData);
      setShowEditModal(false);
      setEditingFolder(null);
    } catch (error) {
      console.error('Update folder error:', error);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolder(folderId);
    } catch (error) {
      console.error('Delete folder error:', error);
    }
  };

  if (loading && folders.length === 0) {
    return <LoadingSpinner message="Loading folders..." />;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Folders</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          New Folder
        </button>
      </div>

      <ErrorMessage error={error} onClose={clearError} />

      {folders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-folder2-open display-1 text-muted"></i>
          <h4 className="mt-3 text-muted">No folders yet</h4>
          <p className="text-muted">Create your first folder to get started!</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create First Folder
          </button>
        </div>
      ) : (
        <div className="row">
          {folders.map(folder => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onEdit={handleEditFolder}
              onDelete={handleDeleteFolder}
            />
          ))}
        </div>
      )}

      {/* Create Folder Modal */}
      <CreateFolderModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateFolder}
        loading={loading}
      />

      {/* Edit Folder Modal */}
      <EditFolderModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingFolder(null);
        }}
        onSubmit={handleUpdateFolder}
        folder={editingFolder}
        loading={loading}
      />
    </div>
  );
};

export default FolderList;