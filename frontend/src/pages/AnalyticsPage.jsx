import {
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Center,
    Group,
    Loader,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { AlertCircle, BarChart3, BookOpen, Brain, Eye, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import AccuracyGraph from '../components/analytics/AccuracyGraph';
import ProgressChart from '../components/analytics/ProgressChart';
import StatsCard from '../components/analytics/StatsCard';
import { analyticsService } from '../services/analyticsService';

const AnalyticsPage = () => {
  const [generalStats, setGeneralStats] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [folderAnalytics, setFolderAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [hasRealData, setHasRealData] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [demoMode]);

  useEffect(() => {
    if (selectedFolderId) {
      loadFolderAnalytics(selectedFolderId);
    } else {
      setFolderAnalytics(null);
    }
  }, [selectedFolderId, demoMode]);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsResult, foldersResult] = await Promise.all([
        analyticsService.getGeneralStats(demoMode),
        analyticsService.getFoldersForAnalytics(demoMode)
      ]);

      if (statsResult.success) {
        if (statsResult.isEmpty && !demoMode) {
          // No real data available
          setHasRealData(false);
          setGeneralStats(null);
        } else {
          setGeneralStats(statsResult.data);
          setHasRealData(!statsResult.isMockData);
        }
      } else {
        setError(statsResult.error);
      }

      if (foldersResult.success) {
        if (foldersResult.isEmpty && !demoMode) {
          setFolders([]);
        } else {
          setFolders(foldersResult.folders);
        }
      }
    } catch (error) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadFolderAnalytics = async (folderId) => {
    setAnalyticsLoading(true);
    setError('');

    try {
      const result = await analyticsService.getFolderAnalytics(folderId, demoMode);
      if (result.success) {
        if (result.isEmpty && !demoMode) {
          setFolderAnalytics(null);
        } else {
          setFolderAnalytics(result.data);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load folder analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleToggleDemo = () => {
    setDemoMode(!demoMode);
    setSelectedFolderId(null);
    setFolderAnalytics(null);
  };

  if (loading) {
    return (
      <Center style={{ minHeight: '60vh' }}>
        <Stack align="center" gap="md">
          <Loader color="blue" size="lg" />
          <Text c="dimmed">Loading analytics...</Text>
        </Stack>
      </Center>
    );
  }

  const folderOptions = folders.map(folder => ({
    value: folder.id.toString(),
    label: folder.name
  }));

  const showEmptyState = !hasRealData && !demoMode && generalStats === null;

  return (
    <Box>
      {/* Header */}
      <Group align="flex-start" mb="xl">
        <ThemeIcon size="xl" variant="light" color="blue">
          <BarChart3 size={28} />
        </ThemeIcon>
        
        <Stack gap={4} style={{ flex: 1 }}>
          <Group justify="space-between">
            <Title order={1} size="h2">
              Analytics Dashboard
            </Title>
            
            {/* Demo Mode Toggle */}
            <Group gap="md">
              {demoMode && (
                <Badge variant="filled" color="orange" size="lg">
                  Demo Mode
                </Badge>
              )}
              
              <Button
                variant={demoMode ? "light" : "filled"}
                color="orange"
                leftSection={<Eye size={16} />}
                onClick={handleToggleDemo}
              >
                {demoMode ? 'Exit Demo' : 'View Demo'}
              </Button>
            </Group>
          </Group>
          
          <Text c="dimmed" size="md">
            Track your learning progress and performance
          </Text>
        </Stack>
      </Group>

      {/* Demo Mode Notice */}
      {demoMode && (
        <Alert color="orange" mb="xl" icon={<AlertCircle size={16} />}>
          <Group justify="space-between">
            <Text size="sm">
              You're viewing demo data to explore analytics features. This shows sample learning progress and performance metrics.
            </Text>
          </Group>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert color="red" mb="xl" icon={<AlertCircle size={16} />}>
          {error}
        </Alert>
      )}

      {/* Empty State - No Real Data */}
      {showEmptyState ? (
        <Stack gap="xl">
          <Card withBorder p="xl" radius="md" style={{ borderStyle: 'dashed' }}>
            <Center>
              <Stack align="center" gap="lg">
                <ThemeIcon size={80} variant="light" color="gray">
                  <BarChart3 size={40} />
                </ThemeIcon>
                
                <Stack align="center" gap="md">
                  <Title order={3} c="dimmed">
                    No Analytics Data Yet
                  </Title>
                  <Text size="sm" c="dimmed" ta="center" maw={500}>
                    Start reviewing your flashcards to generate analytics data. 
                    Once you've completed some reviews, you'll see detailed performance 
                    insights and progress tracking here.
                  </Text>
                </Stack>
                
                <Group>
                  <Button
                    leftSection={<Eye size={16} />}
                    onClick={handleToggleDemo}
                    color="orange"
                  >
                    View Demo Analytics
                  </Button>
                </Group>
              </Stack>
            </Center>
          </Card>
        </Stack>
      ) : (
        <Stack gap="xl">
          {/* General Stats */}
          {generalStats && (
            <Box>
              <Group justify="space-between" mb="md">
                <Title order={3} size="h4">
                  Overview
                </Title>
                {!demoMode && hasRealData && (
                  <Badge variant="light" color="green" size="sm">
                    Live Data
                  </Badge>
                )}
              </Group>
              
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                <StatsCard
                  title="Folders"
                  value={generalStats.total_folders}
                  icon={<BookOpen size={24} />}
                  color="blue"
                />
                <StatsCard
                  title="Decks"
                  value={generalStats.total_decks}
                  icon={<Brain size={24} />}
                  color="green"
                />
                <StatsCard
                  title="Total Reviews"
                  value={generalStats.total_reviews}
                  icon={<TrendingUp size={24} />}
                  color="purple"
                />
                <StatsCard
                  title="Study Streak"
                  value={`${generalStats.streak} days`}
                  icon={<BarChart3 size={24} />}
                  color="orange"
                />
              </SimpleGrid>
            </Box>
          )}

          {/* Folder Selection */}
          <Box>
            <Group align="flex-end" mb="md">
              <Stack gap={4} style={{ flex: 1 }}>
                <Title order={3} size="h4">
                  Folder Performance
                </Title>
                <Text c="dimmed" size="sm">
                  Select a folder to view accuracy trends for all decks
                </Text>
              </Stack>
            </Group>

            {folders.length === 0 ? (
              <Alert color="blue" icon={<AlertCircle size={16} />}>
                <Text size="sm">
                  {demoMode 
                    ? "Demo folders loading..." 
                    : "No folders found. Create some folders and decks to see analytics data here."
                  }
                </Text>
              </Alert>
            ) : (
              <>
                <Group mb="lg">
                  <Select
                    placeholder="Choose a folder to analyze"
                    data={folderOptions}
                    value={selectedFolderId}
                    onChange={setSelectedFolderId}
                    style={{ minWidth: 250 }}
                    clearable
                  />
                  
                  {selectedFolderId && (
                    <Button
                      variant="light"
                      onClick={() => setSelectedFolderId(null)}
                    >
                      Clear Selection
                    </Button>
                  )}
                </Group>

                {/* Folder Analytics */}
                {analyticsLoading ? (
                  <Center py="xl">
                    <Stack align="center" gap="md">
                      <Loader color="blue" />
                      <Text c="dimmed">Loading folder analytics...</Text>
                    </Stack>
                  </Center>
                ) : folderAnalytics ? (
                  <Stack gap="lg">
                    {/* Accuracy Trends Chart */}
                    <Card withBorder p="lg">
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Title order={4}>
                            Accuracy Trends - {folderAnalytics.folder_name}
                          </Title>
                          <Group gap="xs">
                            <Text size="sm" c="dimmed">
                              Last 30 days
                            </Text>
                            {demoMode && (
                              <Badge variant="dot" color="orange" size="sm">
                                Demo
                              </Badge>
                            )}
                          </Group>
                        </Group>
                        
                        <AccuracyGraph 
                          data={folderAnalytics.accuracy_graph}
                          height={300}
                        />
                      </Stack>
                    </Card>

                    {/* Folder Stats */}
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                      <Paper withBorder p="md" radius="md">
                        <Stack align="center" gap="xs">
                          <Text fw={600} size="xl" c="green">
                            {folderAnalytics.full_reviewed_cards}
                          </Text>
                          <Text size="sm" c="dimmed" ta="center">
                            Mastered Cards
                          </Text>
                        </Stack>
                      </Paper>
                      
                      <Paper withBorder p="md" radius="md">
                        <Stack align="center" gap="xs">
                          <Text fw={600} size="xl" c="blue">
                            {folderAnalytics.remaining_cards}
                          </Text>
                          <Text size="sm" c="dimmed" ta="center">
                            Learning Cards
                          </Text>
                        </Stack>
                      </Paper>
                      
                      <Paper withBorder p="md" radius="md">
                        <Stack align="center" gap="xs">
                          <Text fw={600} size="xl" c="purple">
                            {folderAnalytics.total_cards}
                          </Text>
                          <Text size="sm" c="dimmed" ta="center">
                            Total Cards
                          </Text>
                        </Stack>
                      </Paper>
                    </SimpleGrid>

                    {/* Progress Overview */}
                    <Card withBorder p="lg">
                      <Stack gap="md">
                        <Title order={4}>Learning Progress</Title>
                        <ProgressChart 
                          mastered={folderAnalytics.full_reviewed_cards}
                          learning={folderAnalytics.remaining_cards}
                          total={folderAnalytics.total_cards}
                        />
                      </Stack>
                    </Card>
                  </Stack>
                ) : selectedFolderId ? (
                  <Center py="xl">
                    <Text c="dimmed">Loading folder analytics...</Text>
                  </Center>
                ) : (
                  <Card withBorder p="xl" style={{ borderStyle: 'dashed' }}>
                    <Center>
                      <Stack align="center" gap="md">
                        <ThemeIcon size={60} variant="light" color="gray">
                          <BarChart3 size={30} />
                        </ThemeIcon>
                        <Stack align="center" gap="xs">
                          <Title order={4} c="dimmed">
                            Select a Folder to View Analytics
                          </Title>
                          <Text size="sm" c="dimmed" ta="center">
                            Choose a folder from the dropdown above to see accuracy trends
                            and performance metrics for all decks in that folder.
                          </Text>
                        </Stack>
                      </Stack>
                    </Center>
                  </Card>
                )}
              </>
            )}
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default AnalyticsPage;