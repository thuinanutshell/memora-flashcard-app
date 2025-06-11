// src/components/auth/LoginForm.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const LoginForm = () => {
  const { login, loading } = useAuthContext();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.login || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(formData);
      navigate('/'); // Redirect to home after successful login
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h2 className="card-title mb-2">Welcome Back</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                <ErrorMessage error={error} onClose={() => setError('')} />

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="login" className="form-label">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="login"
                      name="login"
                      value={formData.login}
                      onChange={handleChange}
                      placeholder="Enter username or email"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  <div className="d-grid mb-3">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      disabled={loading}
                    >
                      Sign In
                    </Button>
                  </div>
                </form>

                <div className="text-center">
                  <p className="mb-0 text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-decoration-none">
                      Create one
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;