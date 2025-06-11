// src/components/decks/EditDeckModal.jsx
import { useEffect, useState } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';

const EditDeckModal = ({ show, onHide, onSubmit, deck, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (deck) {
      setFormData({
        name: deck.name || '',
        description: deck.description || ''
      });
    }
  }, [deck]);

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
    <Modal show={show} onHide={onHide} title="Edit Deck">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="mb-3">
            <label htmlFor="editDeckName" className="form-label">
              Deck Name *
            </label>
            <input
              type="text"
              className="form-control"
              id="editDeckName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter deck name"
              required
              autoFocus
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="editDeckDescription" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="editDeckDescription"
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
            Update Deck
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditDeckModal;