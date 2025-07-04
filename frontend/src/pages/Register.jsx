// Register.jsx
import {
  Box,
  Container,
  Stack,
  Text,
  Title
} from '@mantine/core';
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
        console.log('Registration successful, user:', result.user);
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
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <Container size={800}>
        <Stack align="center" spacing={10} mb="xl">
          <Title
            ta="center"
            style={{
              background: 'linear-gradient(45deg, #fff, #e0e7ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem',
              fontWeight: 900
            }}
          >
            Memora
          </Title>
          <Text c="white" size="lg" fw={500} ta="center">
            AI-Powered Flashcard Learning
          </Text>
          <Text c="gray.3" size="sm" ta="center" maw={360}>
            Join thousands of learners using AI to master new skills
          </Text>
        </Stack>

        <RegisterForm onRegister={handleRegister} loading={loading} error={error} />
      </Container>
    </Box>
  );
};

export default Register;
