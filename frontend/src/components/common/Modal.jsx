// src/components/common/Modal.jsx
import React from 'react';

const Modal = ({ 
  show, 
  onHide, 
  title, 
  children, 
  size = 'md',
  centered = false,
  backdrop = true,
  keyboard = true 
}) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && backdrop && onHide) {
      onHide();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && keyboard && onHide) {
      onHide();
    }
  };

  React.useEffect(() => {
    if (show && keyboard) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [show, keyboard]);

  if (!show) return null;

  const sizeClasses = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl'
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div className={`modal-dialog ${sizeClasses[size]} ${centered ? 'modal-dialog-centered' : ''}`}>
        <div className="modal-content">
          {title && (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              {onHide && (
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={onHide}
                  aria-label="Close"
                ></button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;