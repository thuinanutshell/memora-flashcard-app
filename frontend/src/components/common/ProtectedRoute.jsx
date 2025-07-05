import { Center, Loader, Text } from '@mantine/core';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';

// Loading spinner component
const LoadingSpinner = () => (
  <Center style={{ minHeight: '100vh' }}>
    <div>
      <Loader color="blue" size="lg" mb="md" />
      <Text c="dimmed">Loading...</Text>
    </div>
  </Center>
);

// Protected Route - requires authentication and wraps with Layout
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
};

export default ProtectedRoute;