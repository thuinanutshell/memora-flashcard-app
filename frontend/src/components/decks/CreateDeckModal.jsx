// src/components/decks/CreateDeckModal.jsx
import { useState } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';

const CreateDeckModal = ({ show, onHide, onSubmit, loading, folderName }) => {
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
    <Modal show={show} onHide={handleClose} title={`Create New Deck in "${folderName}"`}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="deckName" className="form-label">
              Deck Name *
            </label>
            <input
              type="text"
              className="form-control"
              id="deckName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter deck name"
              required
              autoFocus
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="deckDescription" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="deckDescription"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter deck description (optional)"
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
            Create Deck
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateDeckModal;