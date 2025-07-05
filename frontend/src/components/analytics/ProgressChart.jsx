import {
    Box,
    Group,
    Progress,
    Stack,
    Text,
} from '@mantine/core';

const ProgressChart = ({ mastered, learning, total }) => {
  const masteredPercentage = total > 0 ? (mastered / total) * 100 : 0;
  const learningPercentage = total > 0 ? (learning / total) * 100 : 0;
  
  return (
    <Stack gap="md">
      {/* Progress Bar */}
      <Box>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>Learning Progress</Text>
          <Text size="sm" c="dimmed">
            {mastered}/{total} cards mastered ({Math.round(masteredPercentage)}%)
          </Text>
        </Group>
        
        <Progress
          size="xl"
          radius="md"
          sections={[
            { 
              value: masteredPercentage, 
              color: 'green',
              label: mastered > 0 ? 'Mastered' : ''
            },
            { 
              value: learningPercentage, 
              color: 'blue',
              label: learning > 0 ? 'Learning' : ''
            }
          ]}
        />
      </Box>

      {/* Legend */}
      <Group justify="center" gap="xl">
        <Group gap="xs">
          <Box
            w={12}
            h={12}
            style={{ 
              backgroundColor: 'var(--mantine-color-green-6)',
              borderRadius: '2px'
            }}
          />
          <Text size="sm">
            Mastered ({mastered})
          </Text>
        </Group>
        
        <Group gap="xs">
          <Box
            w={12}
            h={12}
            style={{ 
              backgroundColor: 'var(--mantine-color-blue-6)',
              borderRadius: '2px'
            }}
          />
          <Text size="sm">
            Learning ({learning})
          </Text>
        </Group>
      </Group>

      {/* Quick Stats */}
      <Group justify="space-around" pt="md">
        <Stack align="center" gap={4}>
          <Text fw={600} size="lg" c="green">
            {Math.round(masteredPercentage)}%
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            Completion Rate
          </Text>
        </Stack>
        
        <Stack align="center" gap={4}>
          <Text fw={600} size="lg" c="blue">
            {learning}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            Cards to Review
          </Text>
        </Stack>
        
        <Stack align="center" gap={4}>
          <Text fw={600} size="lg" c="purple">
            {total}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            Total Cards
          </Text>
        </Stack>
      </Group>
    </Stack>
  );
};

export default ProgressChart;