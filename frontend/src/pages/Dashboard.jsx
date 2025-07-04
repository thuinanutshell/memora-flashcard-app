import {
  Box,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { BarChart3, BookOpen, Brain, Folder, LogOut } from 'lucide-react';
import Button from '../components/common/Button';
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
    <Box bg="gray.0" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Box bg="white" px="md" py="sm" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <Container size="xl">
          <Group position="apart" align="center">
            <Title order={2} fw={700} size="lg" c="gray.9">Memora</Title>
            <Group spacing="md">
              <Text size="sm" c="gray.6">Welcome, {user?.full_name}</Text>
              <Button variant="outline" onClick={handleLogout} leftSection={<LogOut size={16} />}>
                Sign Out
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Content */}
      <Container size="xl" py="xl">
        <Stack spacing="md">
          <Box>
            <Title order={3} size="xl" fw={700} c="gray.9" mb={4}>
              Welcome back, {user?.full_name}! 🎉
            </Title>
            <Text c="gray.6">Ready to continue your learning journey?</Text>
          </Box>

          {/* Stats Cards */}
          <Group grow align="stretch" spacing="lg">
            {stats.map(({ label, icon, bg, value }, idx) => (
              <Paper key={idx} p="md" radius="md" shadow="sm" withBorder>
                <Group align="center">
                  <Box bg={bg} p="xs" radius="md">
                    {icon}
                  </Box>
                  <Stack spacing={0}>
                    <Text size="sm" c="gray.6">{label}</Text>
                    <Text fw={700} size="xl" c="gray.9">{value}</Text>
                  </Stack>
                </Group>
              </Paper>
            ))}
          </Group>

          {/* Folder Section */}
          <FolderList />
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
