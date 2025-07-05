import {
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Folder, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { folderService } from '../../services/folderService';
import CreateFolderModal from './CreateFolderModal';
import FolderCard from './FolderCard';

const FolderList = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await folderService.getAllFolders();
      if (result.success) {
        setFolders(result.folders);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (folderData) => {
    const result = await folderService.createFolder(folderData);
    if (result.success) {
      setFolders(prev => [...prev, result.folder]);
      setShowCreateModal(false);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleEditFolder = (folder) => {
    // TODO: Implement edit functionality
    console.log('Edit folder:', folder);
  };

  const handleDeleteFolder = async (folder) => {
    if (window.confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      const result = await folderService.deleteFolder(folder.id);
      if (result.success) {
        setFolders(prev => prev.filter(f => f.id !== folder.id));
      } else {
        setError(result.error);
      }
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader color="blue" />
          <Text c="dimmed">Loading folders...</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Text c="red">{error}</Text>
          <Button variant="light" onClick={loadFolders}>
            Try Again
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <Stack gap={4}>
          <Title order={2} size="h3">
            Your Folders
          </Title>
          <Text c="dimmed" size="sm">
            Organize your study materials
          </Text>
        </Stack>
        
        <Button 
          leftSection={<Plus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Folder
        </Button>
      </Group>

      {/* Folders Grid */}
      {folders.length === 0 ? (
        <Card
          withBorder
          padding="xl"
          radius="md"
          style={{ borderStyle: 'dashed' }}
        >
          <Center>
            <Stack align="center" gap="md">
              <ThemeIcon size={60} variant="light" color="gray">
                <Folder size={30} />
              </ThemeIcon>
              
              <Stack align="center" gap="xs">
                <Title order={4} c="dimmed">
                  No folders yet
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                  Create your first folder to get started organizing your study materials
                </Text>
              </Stack>
              
              <Button 
                leftSection={<Plus size={16} />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Folder
              </Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing="lg"
        >
          {folders.map(folder => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onEdit={handleEditFolder}
              onDelete={handleDeleteFolder}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <CreateFolderModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateFolder}
        />
      )}
    </Box>
  );
};

export default FolderList;