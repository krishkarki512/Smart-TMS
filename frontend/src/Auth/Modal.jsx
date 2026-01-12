import React, { useEffect, useCallback } from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  // Handles closing the modal with the ESC key
  const handleEsc = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEsc);
    } else {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">{title}</h3>
          {/* Enhanced Close Button Design */}
          <button 
            className="modal-close-btn-fancy" 
            onClick={onClose} 
            aria-label="Close modal"
          >
            &times; 
          </button>
        </div>
        <div className="modal-body">
          <pre className="modal-text">{children}</pre>
        </div>
      </div>
    </div>
  );
};

export default Modal;