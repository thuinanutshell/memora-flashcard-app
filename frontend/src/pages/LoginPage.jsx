// src/pages/LoginPage.jsx

import { Card } from 'react-bootstrap';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div style={{ minHeight: '100vh' }} className="d-flex justify-content-center align-items-center">
      <Card className="p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>
        <LoginForm />
      </Card>
    </div>
  );
};

export default LoginPage;
