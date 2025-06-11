// src/components/folders/FolderCard.jsx
import { Link } from 'react-router-dom';

const FolderCard = ({ folder, onEdit, onDelete }) => {
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(folder);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      onDelete(folder.id);
    }
  };

  return (
    <div className="col-md-6 col-lg-4 mb-3">
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0">{folder.name}</h5>
            <div className="dropdown">
              <button 
                className="btn btn-link btn-sm p-0" 
                data-bs-toggle="dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="bi bi-three-dots-vertical"></i>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={handleEdit}>
                    <i className="bi bi-pencil me-2"></i>Edit
                  </button>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleDelete}>
                    <i className="bi bi-trash me-2"></i>Delete
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {folder.description && (
            <p className="card-text text-muted small mb-2">{folder.description}</p>
          )}
          
          <div className="row text-center">
            <div className="col-6">
              <small className="text-muted">Decks</small>
              <div className="fw-bold text-primary">{folder.deckCount || 0}</div>
            </div>
            <div className="col-6">
              <small className="text-muted">Cards</small>
              <div className="fw-bold text-success">{folder.cardCount || 0}</div>
            </div>
          </div>
        </div>
        
        <div className="card-footer bg-transparent">
          <Link 
            to={`/folders/${folder.id}`} 
            className="btn btn-outline-primary btn-sm w-100"
          >
            Open Folder
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FolderCard;