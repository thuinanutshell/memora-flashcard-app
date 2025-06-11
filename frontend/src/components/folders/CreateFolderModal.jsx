// src/components/folders/CreateFolderModal.jsx
import { useState } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';

const CreateFolderModal = ({ show, onHide, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

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
    setFormData({ name: '', description: '' });
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} title="Create New Folder">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Folder Name *
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter folder name"
              required
              autoFocus
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
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
            onClick={handleClose}
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
            Create Folder
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateFolderModal;