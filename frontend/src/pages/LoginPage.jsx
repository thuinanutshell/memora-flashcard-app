import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if there's a success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="login-page">
      {successMessage && (
        <div className="success-message" role="alert">
          {successMessage}
          <button 
            type="button" 
            className="success-close"
            onClick={() => setSuccessMessage('')}
            aria-label="Close success message"
          >
            ×
          </button>
        </div>
      )}
      <LoginForm />
    </div>
  );
};

export default LoginPage;