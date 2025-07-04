import {
  Box,
  Center,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Folder, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { folderService } from '../../services/folderService';
import Button from '../common/Button';
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

  if (loading) {
    return (
      <Center py="xl">
        <Loader color="blue" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center py="xl">
        <Stack align="center" spacing="sm">
          <Text c="red.6">{error}</Text>
          <Button onClick={loadFolders}>Try Again</Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Group position="apart" mb="lg">
        <div>
          <Title order={2} size="lg" fw={700} c="gray.9">
            Your Folders
          </Title>
          <Text c="gray.6">Organize your study materials</Text>
        </div>
        <Button onClick={() => setShowCreateModal(true)} leftSection={<Plus size={16} />}>
          Create Folder
        </Button>
      </Group>

      {/* Folders Grid */}
      {folders.length === 0 ? (
        <Paper
          withBorder
          radius="md"
          py="xl"
          px="md"
          mt="sm"
          c="gray.6"
          ta="center"
          style={{
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: '#d1d5db',
          }}
        >
          <Center mb="md">
            <Folder size={48} color="#9ca3af" />
          </Center>
          <Title order={4} fw={600} mb={6} c="gray.9">
            No folders yet
          </Title>
          <Text size="sm" mb="md">
            Create your first folder to get started
          </Text>
          <Button onClick={() => setShowCreateModal(true)} leftSection={<Plus size={16} />}>
            Create Your First Folder
          </Button>
        </Paper>
      ) : (
        <Grid gutter="lg">
          {folders.map(folder => (
            <Grid.Col key={folder.id} span={{ base: 12, sm: 6, md: 4 }}>
              <FolderCard
                folder={folder}
                onEdit={() => {/* TODO */}}
                onDelete={() => {/* TODO */}}
              />
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Modal */}
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
