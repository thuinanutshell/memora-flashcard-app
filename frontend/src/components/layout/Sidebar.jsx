// src/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuthContext();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (window.innerWidth < 992) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`bg-light border-end position-fixed position-lg-sticky top-0 h-100 ${
          isOpen ? 'translate-x-0' : 'translate-x-n100'
        } d-lg-block`}
        style={{ 
          width: '250px',
          zIndex: 1050,
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div className="p-3">
          {/* Brand/Title */}
          <div className="text-center mb-4 pb-3 border-bottom">
            <h4 className="text-primary fw-bold mb-1">
              <i className="bi bi-card-text me-2"></i>
              FlashCard App
            </h4>
            <small className="text-muted">Welcome, {user?.full_name || user?.username}</small>
          </div>

          {/* Navigation */}
          <h6 className="text-muted text-uppercase fw-bold mb-3 small">Navigation</h6>
          
          <ul className="nav nav-pills flex-column">
            <li className="nav-item mb-1">
              <Link 
                className={`nav-link ${isActive('/')}`} 
                to="/"
                onClick={handleLinkClick}
              >
                <i className="bi bi-house me-2"></i>
                Dashboard
              </Link>
            </li>
            
            <li className="nav-item mb-1">
              <Link 
                className={`nav-link ${isActive('/folders')}`} 
                to="/folders"
                onClick={handleLinkClick}
              >
                <i className="bi bi-folder me-2"></i>
                My Folders
              </Link>
            </li>

            <li className="nav-item mb-1">
              <Link 
                className={`nav-link ${isActive('/review')}`} 
                to="/review"
                onClick={handleLinkClick}
              >
                <i className="bi bi-card-checklist me-2"></i>
                Review Cards
              </Link>
            </li>

            <li className="nav-item mb-1">
              <Link 
                className={`nav-link ${isActive('/stats')}`} 
                to="/stats"
                onClick={handleLinkClick}
              >
                <i className="bi bi-graph-up me-2"></i>
                Statistics
              </Link>
            </li>
          </ul>

          <hr />

          {/* Quick Actions */}
          <h6 className="text-muted text-uppercase fw-bold mb-3 small">Quick Actions</h6>
          <div className="d-grid gap-2 mb-4">
            <Link to="/folders" className="btn btn-outline-primary btn-sm" onClick={handleLinkClick}>
              <i className="bi bi-plus-circle me-1"></i>
              New Folder
            </Link>
            <Link to="/review" className="btn btn-outline-success btn-sm" onClick={handleLinkClick}>
              <i className="bi bi-play-circle me-1"></i>
              Start Review
            </Link>
          </div>

          <hr />

          {/* User Actions */}
          <div className="d-grid gap-2">
            <Link to="/profile" className="btn btn-outline-secondary btn-sm" onClick={handleLinkClick}>
              <i className="bi bi-person me-1"></i>
              Profile
            </Link>
            <Link to="/settings" className="btn btn-outline-secondary btn-sm" onClick={handleLinkClick}>
              <i className="bi bi-gear me-1"></i>
              Settings
            </Link>
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;