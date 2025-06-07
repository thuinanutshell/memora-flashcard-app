import { useEffect, useState } from 'react';
import { createFolder, updateFolder } from '../../api/folderApi';
import useAuth from '../../hooks/useAuth';

const FolderForm = ({ folder, onSuccess, onCancel }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folder) {
      setFormData({
        name: folder.name || '',
        description: folder.description || ''
      });
    }
  }, [folder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      if (folder) {
        // Update existing folder
        await updateFolder(token, folder.id, formData);
      } else {
        // Create new folder
        await createFolder(token, formData);
      }
      
      setFormData({ name: '', description: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving folder:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>{folder ? 'Edit Folder' : 'Create New Folder'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (folder ? 'Update' : 'Create')}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FolderForm;