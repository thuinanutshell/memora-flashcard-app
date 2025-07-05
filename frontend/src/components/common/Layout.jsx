import {
    AppShell,
    Box,
    Burger,
    Divider,
    Group,
    NavLink,
    Stack,
    Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { BarChart3, Brain, Home, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    </AppShell>
  );
};

export default Layout;