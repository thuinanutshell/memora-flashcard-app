import {
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { BarChart3, BookOpen, Brain, Folder, LogOut } from 'lucide-react';
import FolderList from '../components/folders/FolderList';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const stats = [
    {
      label: 'Folders',
      icon: <Folder size={24} color="#2563eb" />,
      bg: 'blue.1',
      value: '-',
    },
    {
      label: 'Decks',
      icon: <BookOpen size={24} color="#16a34a" />,
      bg: 'green.1',
      value: '-',
    },
    {
      label: 'Cards',
      icon: <Brain size={24} color="#7e22ce" />,
      bg: 'purple.1',
      value: '-',
    },
    {
      label: 'Study Streak',
      icon: <BarChart3 size={24} color="#ea580c" />,
      bg: 'orange.1',
      value: '0',
    },
  ];

  return (
    <Box style={{ minHeight: '100vh' }}>

      {/* Content */}
      <Container size="xl" py="xl">
        <Stack spacing="md">
          {/* Folder Section */}
          <FolderList />
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
