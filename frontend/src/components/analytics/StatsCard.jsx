import {
    Group,
    Paper,
    Stack,
    Text,
    ThemeIcon,
} from '@mantine/core';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  description = null,
  trend = null 
}) => {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4} style={{ flex: 1 }}>
          <Text c="dimmed" size="sm" fw={500}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
          {trend && (
            <Text 
              size="xs" 
              c={trend.direction === 'up' ? 'green' : trend.direction === 'down' ? 'red' : 'dimmed'}
              fw={500}
            >
              {trend.direction === 'up' && '↗ '}
              {trend.direction === 'down' && '↘ '}
              {trend.value}
            </Text>
          )}
        </Stack>
        
        <ThemeIcon 
          size="lg" 
          variant="light" 
          color={color}
        >
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
};

export default StatsCard;