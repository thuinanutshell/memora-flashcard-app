// src/components/folders/EditFolderModal.jsx
import { useEffect, useState } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';

const EditFolderModal = ({ show, onHide, onSubmit, folder, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

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
    
    await onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} title="Edit Folder">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="editName" className="form-label">
              Folder Name *
            </label>
            <input
              type="text"
              className="form-control"
              id="editName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter folder name"
              required
              autoFocus
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="editDescription" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="editDescription"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter folder description (optional)"
              rows="3"
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onHide}
            disabled={loading}
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!formData.name.trim() || loading}
          >
            Update Folder
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFolderModal;