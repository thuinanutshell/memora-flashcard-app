import { Text } from '@mantine/core';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AccuracyGraph = ({ data, height = 300 }) => {
  // Transform the data structure for Recharts
  // data is an object with deck names as keys and arrays of {date, accuracy} as values
  const transformedData = {};
  const allDates = new Set();
  
  // Collect all unique dates and organize data by date
  Object.entries(data).forEach(([deckName, points]) => {
    points.forEach(point => {
      allDates.add(point.date);
      if (!transformedData[point.date]) {
        transformedData[point.date] = { date: point.date };
      }
      transformedData[point.date][deckName] = point.accuracy;
    });
  });

  // Convert to array and sort by date
  const chartData = Object.values(transformedData).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <Text fw={500} size="sm" mb="xs">
            {formattedDate}
          </Text>
          {payload.map((entry, index) => (
            <Text
              key={index}
              size="sm"
              style={{ color: entry.color }}
            >
              {entry.dataKey}: {entry.value?.toFixed(1)}%
            </Text>
          ))}
        </div>
      );
    }
    return null;
  };

  // Color palette for different decks
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
  ];

  const deckNames = Object.keys(data);

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text c="dimmed">No data available</Text>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis 
          dataKey="date"
          tickFormatter={formatDate}
          stroke="#666"
          fontSize={12}
        />
        <YAxis 
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          stroke="#666"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {deckNames.map((deckName, index) => (
          <Line
            key={deckName}
            type="monotone"
            dataKey={deckName}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AccuracyGraph;