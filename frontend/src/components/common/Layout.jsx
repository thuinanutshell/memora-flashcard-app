import {
    AppShell,
    Badge,
    Box,
    Burger,
    Divider,
    Group,
    NavLink,
    Stack,
    Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { BarChart3, Brain, Clock, Home, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReviewQueue from '../review/reviewQueue';
import { useAuth } from '../../context/AuthContext';
import { useReviewQueue } from '../../hooks/useReview';

const Layout = ({ children }) => {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showReviewQueue, setShowReviewQueue] = useState(false);

  // Review queue hook
  const { queueLength, loadQueue, loading: queueLoading } = useReviewQueue();

  useEffect(() => {
    // Load review queue when layout mounts
    loadQueue();
    
    // Refresh queue every 5 minutes
    const interval = setInterval(loadQueue, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
    },
    {
      label: 'AI Chat',
      icon: Brain,
      path: '/ai-chat',
    },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />
          <Text size="xl" fw={700} c="blue">
            Memora
          </Text>
          
          {/* Review Queue Indicator in Header */}
          {queueLength > 0 && (
            <Group gap="xs" style={{ marginLeft: 'auto' }} visibleFrom="sm">
              <Badge 
                variant="filled" 
                color="orange" 
                size="sm"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowReviewQueue(true)}
                leftSection={<Clock size={12} />}
              >
                {queueLength} due
              </Badge>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack justify="space-between" h="100%">
          <Stack gap="xs">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  label={item.label}
                  leftSection={<Icon size={18} />}
                  active={isActive}
                  onClick={() => navigate(item.path)}
                  variant="filled"
                />
              );
            })}

            {/* Review Queue Navigation Item */}
            <NavLink
              label={
                <Group justify="space-between" w="100%">
                  <Text>Review Queue</Text>
                  {queueLength > 0 && (
                    <Badge variant="filled" color="orange" size="xs">
                      {queueLength}
                    </Badge>
                  )}
                </Group>
              }
              leftSection={<Clock size={18} />}
              onClick={() => setShowReviewQueue(true)}
              variant="light"
              color={queueLength > 0 ? 'orange' : 'gray'}
            />

            <Divider my="sm" />
            
            {/* Quick Stats */}
            <Box p="xs">
              <Text size="xs" c="dimmed" fw={500} mb="xs">
                Quick Stats
              </Text>
              <Stack gap={4}>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Cards due:</Text>
                  <Text size="xs" fw={500} c={queueLength > 0 ? 'orange' : 'green'}>
                    {queueLoading ? '...' : queueLength}
                  </Text>
                </Group>
              </Stack>
            </Box>
          </Stack>

          <Box>
            <Divider mb="md" />
            <Text size="xs" c="dimmed" mb="xs">
              {user?.full_name}
            </Text>
            <NavLink
              label="Sign Out"
              leftSection={<LogOut size={18} />}
              onClick={handleLogout}
              color="red"
            />
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>

      {/* Review Queue Modal */}
      {showReviewQueue && (
        <ReviewQueue
          opened={showReviewQueue}
          onClose={() => setShowReviewQueue(false)}
        />
      )}
    </AppShell>
  );
};

export default Layout;