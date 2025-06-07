import { useState } from 'react';
import FolderDetail from './FolderDetail';
import FolderForm from './FolderForm';
import FolderList from './FolderList';

const FolderManager = () => {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
    setEditingFolder(null);
    setShowCreateForm(false);
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setSelectedFolder(null);
    setShowCreateForm(false);
  };

  const handleCreateNew = () => {
    setShowCreateForm(true);
    setEditingFolder(null);
    setSelectedFolder(null);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingFolder(null);
    setSelectedFolder(null);
    setRefreshKey(prev => prev + 1); // Force refresh of folder list
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingFolder(null);
  };

  return (
    <div>
      <h2>Folder Management</h2>
      
      <button onClick={handleCreateNew}>
        Create New Folder
      </button>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1 }}>
          <FolderList
            key={refreshKey}
            onSelectFolder={handleSelectFolder}
            onEditFolder={handleEditFolder}
          />
        </div>

        <div style={{ flex: 2 }}>
          {showCreateForm && (
            <FolderForm
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          )}

          {editingFolder && (
            <FolderForm
              folder={editingFolder}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          )}

          {selectedFolder && !editingFolder && !showCreateForm && (
            <FolderDetail folder={selectedFolder} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderManager;