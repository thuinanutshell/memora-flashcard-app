import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { AlertTriangle, CheckCircle, Lightbulb, TrendingUp, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { aiChatService } from '../../services/aiChatService';

const StudySuggestions = ({ opened, onClose }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestionType, setSuggestionType] = useState('quick');

  useEffect(() => {
    if (opened) {
      loadSuggestions(suggestionType);
    }
  }, [opened, suggestionType]);

  const loadSuggestions = async (type) => {
    setLoading(true);
    setError('');

    try {
      const result = await aiChatService.getStudySuggestions(type);
      if (result.success) {
        setSuggestions(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load study suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    setSuggestionType(type);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Lightbulb size={20} />
          <Text fw={600}>Study Suggestions</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Suggestion Type Toggle */}
        <Group>
          <Button
            variant={suggestionType === 'quick' ? 'filled' : 'light'}
            size="sm"
            onClick={() => handleTypeChange('quick')}
          >
            Quick Tips
          </Button>
          <Button
            variant={suggestionType === 'detailed' ? 'filled' : 'light'}
            size="sm"
            onClick={() => handleTypeChange('detailed')}
          >
            Detailed Plan
          </Button>
        </Group>

        {loading ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader color="orange" />
              <Text c="dimmed">Generating personalized suggestions...</Text>
            </Stack>
          </Center>
        ) : error ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Text c="red">{error}</Text>
              <Button variant="light" onClick={() => loadSuggestions(suggestionType)}>
                Try Again
              </Button>
            </Stack>
          </Center>
        ) : suggestions ? (
          <Stack gap="lg">
            {/* Recommendations */}
            <Card withBorder p="md">
              <Stack gap="md">
                <Group>
                  <ThemeIcon size="lg" variant="light" color="orange">
                    <Lightbulb size={24} />
                  </ThemeIcon>
                  <Title order={4}>Personalized Recommendations</Title>
                </Group>
                
                <Stack gap="xs">
                  {suggestions.recommendations.map((recommendation, index) => (
                    <Group key={index} gap="xs" align="flex-start">
                      <ThemeIcon size="sm" variant="light" color="orange">
                        <CheckCircle size={12} />
                      </ThemeIcon>
                      <Text size="sm" style={{ flex: 1 }}>
                        {recommendation}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Card>

            {/* Focus Areas */}
            {suggestions.focus_areas && suggestions.focus_areas.length > 0 && (
              <Card withBorder p="md">
                <Stack gap="md">
                  <Group>
                    <ThemeIcon size="lg" variant="light" color="blue">
                      <TrendingUp size={24} />
                    </ThemeIcon>
                    <Title order={4}>Focus Areas</Title>
                  </Group>
                  
                  <Stack gap="sm">
                    {suggestions.focus_areas.map((area, index) => (
                      <Box key={index}>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" fw={500}>{area.topic}</Text>
                          <Badge 
                            variant="light" 
                            color={area.completion_rate >= 70 ? 'green' : area.completion_rate >= 50 ? 'yellow' : 'red'}
                            size="sm"
                          >
                            {area.completion_rate}% complete
                          </Badge>
                        </Group>
                        <Progress 
                          value={area.completion_rate} 
                          size="sm"
                          color={area.completion_rate >= 70 ? 'green' : area.completion_rate >= 50 ? 'yellow' : 'red'}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            )}

            {/* Recent Struggles */}
            {suggestions.recent_struggles && suggestions.recent_struggles.length > 0 && (
              <Card withBorder p="md">
                <Stack gap="md">
                  <Group>
                    <ThemeIcon size="lg" variant="light" color="red">
                      <AlertTriangle size={24} />
                    </ThemeIcon>
                    <Title order={4}>Recent Struggles</Title>
                  </Group>
                  
                  <Text size="sm" c="dimmed">
                    Cards that need more attention based on recent performance:
                  </Text>
                  
                  <Stack gap="xs">
                    {suggestions.recent_struggles.map((struggle, index) => (
                      <Card key={index} withBorder bg="red.0" p="xs">
                        <Group justify="space-between">
                          <Text size="sm" style={{ flex: 1 }}>
                            {struggle.question}
                          </Text>
                          <Badge color="red" size="sm">
                            {struggle.score}%
                          </Badge>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            )}

            {/* Detailed Study Plan (only for detailed type) */}
            {suggestionType === 'detailed' && suggestions.study_plan && (
              <Card withBorder p="md">
                <Stack gap="md">
                  <Group>
                    <ThemeIcon size="lg" variant="light" color="purple">
                      <Trophy size={24} />
                    </ThemeIcon>
                    <Title order={4}>Study Plan</Title>
                  </Group>
                  
                  <SimpleGrid cols={1} spacing="md">
                    <Box>
                      <Text fw={500} size="sm" mb="xs" c="red">
                        Immediate Focus
                      </Text>
                      <Group gap="xs">
                        {suggestions.study_plan.immediate_focus.map((topic, index) => (
                          <Badge key={index} variant="light" color="red">
                            {topic}
                          </Badge>
                        ))}
                      </Group>
                    </Box>
                    
                    <Box>
                      <Text fw={500} size="sm" mb="xs" c="green">
                        Mastered Areas
                      </Text>
                      <Group gap="xs">
                        {suggestions.study_plan.mastered_areas.map((topic, index) => (
                          <Badge key={index} variant="light" color="green">
                            {topic}
                          </Badge>
                        ))}
                      </Group>
                    </Box>
                    
                    <Box>
                      <Text fw={500} size="sm" mb="xs" c="blue">
                        Areas for Improvement
                      </Text>
                      <Group gap="xs">
                        {suggestions.study_plan.improvement_areas.map((topic, index) => (
                          <Badge key={index} variant="light" color="blue">
                            {topic}
                          </Badge>
                        ))}
                      </Group>
                    </Box>
                  </SimpleGrid>
                </Stack>
              </Card>
            )}

            {/* Metrics (only for detailed type) */}
            {suggestionType === 'detailed' && suggestions.metrics && (
              <Card withBorder p="md">
                <Stack gap="md">
                  <Title order={4}>Current Performance</Title>
                  
                  <SimpleGrid cols={2} spacing="md">
                    <Box ta="center">
                      <Text fw={700} size="xl" c="blue">
                        {suggestions.metrics.total_reviews}
                      </Text>
                      <Text size="xs" c="dimmed">Total Reviews</Text>
                    </Box>
                    
                    <Box ta="center">
                      <Text fw={700} size="xl" c="green">
                        {suggestions.metrics.average_score}%
                      </Text>
                      <Text size="xs" c="dimmed">Average Score</Text>
                    </Box>
                    
                    <Box ta="center">
                      <Text fw={700} size="xl" c="orange">
                        {suggestions.metrics.study_streak}
                      </Text>
                      <Text size="xs" c="dimmed">Day Streak</Text>
                    </Box>
                    
                    <Box ta="center">
                      <Text fw={700} size="xl" c="purple">
                        {suggestions.metrics.weekly_goal_progress}%
                      </Text>
                      <Text size="xs" c="dimmed">Weekly Goal</Text>
                    </Box>
                  </SimpleGrid>
                </Stack>
              </Card>
            )}

            {/* Action Buttons */}
            <Group justify="center" pt="md">
              <Button
                variant="light"
                leftSection={<Lightbulb size={16} />}
                onClick={() => loadSuggestions(suggestionType)}
              >
                Refresh Suggestions
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Stack>
    </Modal>
  );
};

export default StudySuggestions;