
const ErrorMessage = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between mb-3" role="alert">
      <div className="d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <span>{error}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default ErrorMessage;