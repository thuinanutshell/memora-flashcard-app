import {
  Box,
  Center,
  Container,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(credentials);
      
      if (result.success) {
        console.log('Login successful, user:', result.user);
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Container size={800}>
        <Center mb={30}>
          <Stack align="center" gap="md">
            
            <Stack align="center" gap={5}>
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
              <Text c="gray.3" size="sm" ta="center" maw={300}>
                Transform your study materials into interactive flashcards with the power of AI
              </Text>
            </Stack>
          </Stack>
        </Center>

        <LoginForm onLogin={handleLogin} loading={loading} error={error} />
      </Container>
    </Box>
  );
};

export default Login;