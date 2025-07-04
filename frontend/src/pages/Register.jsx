import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    setLoading(true);
    setError('');

    try {
      const result = await register(userData);
      
      if (result.success) {
        // The AuthContext will update the user state
        // and the ProtectedRoute will handle the redirect
        console.log('Registration successful, user:', result.user);
        // Navigate programmatically as backup
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Memora</h1>
          <p className="text-gray-600">AI-Powered Flashcard Learning</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Register Form */}
        <RegisterForm onRegister={handleRegister} loading={loading} />
      </div>
    </div>
  );
};

export default Register;