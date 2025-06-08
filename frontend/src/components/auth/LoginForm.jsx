// src/components/auth/LoginForm.jsx

import { useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function LoginForm() {
  const [credentials, setCredentials] = useState({
    login: '',
    password: ''
  });

  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="login" className="mb-3">
        <Form.Label>Username or Email</Form.Label>
        <Form.Control
          type="text"
          name="login"
          value={credentials.login}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="password" className="mb-4">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-100"
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <div className="text-center mt-3">
        No have an account? <a href="/register" className="auth-link">Register</a>
      </div>
    </Form>
  );
}

export default LoginForm;
