// src/components/stats/FolderOverviewChart.jsx
import { useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const FolderOverviewChart = ({ data, title = "Folder Performance Overview" }) => {
  // Color palette for different folder lines
  const colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6c757d'
  ];

  // Process data for line chart
  const { chartData, folderNames } = useMemo(() => {
    if (!data || typeof data !== 'object') {
      return { chartData: [], folderNames: [] };
    }

    const folderMap = new Map();
    const allTimestamps = new Set();

    // Process each folder's data
    Object.keys(data).forEach(folderName => {
      const folderReviews = data[folderName];
      
      if (Array.isArray(folderReviews)) {
        folderReviews.forEach(item => {
          const timestamp = new Date(item.timestamp).getTime();
          
          if (!folderMap.has(folderName)) {
            folderMap.set(folderName, new Map());
          }
          
          folderMap.get(folderName).set(timestamp, item.score);
          allTimestamps.add(timestamp);
        });
      }
    });

    // Convert to chart data format
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
    const chartData = sortedTimestamps.map(timestamp => {
      const dataPoint = {
        timestamp,
        date: new Date(timestamp).toLocaleDateString(),
        time: new Date(timestamp).toLocaleString()
      };

      // Add each folder's score for this timestamp (if it exists)
      folderMap.forEach((scores, folderName) => {
        dataPoint[folderName] = scores.get(timestamp) || null;
      });

      return dataPoint;
    });

    const folderNames = Array.from(folderMap.keys());
    return { chartData, folderNames };
  }, [data]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark text-white p-2 rounded shadow">
          <p className="mb-1">{data.time}</p>
          {payload.map((entry, index) => (
            entry.value !== null && (
              <p key={index} className="mb-0" style={{ color: entry.color }}>
                {entry.dataKey}: {Math.round(entry.value)}%
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <h6 className="card-title">{title}</h6>
          <p className="text-muted">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="card-title mb-3">{title}</h6>

        {/* Chart */}
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 100]}
                  stroke="#666"
                  fontSize={12}
                  label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Render a line for each folder */}
                {folderNames.map((folderName, index) => (
                  <Line
                    key={folderName}
                    type="monotone"
                    dataKey={folderName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls={false}
                    name={folderName}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">No chart data available</p>
          </div>
        )}

        {/* Chart Info */}
        <div className="mt-3">
          <small className="text-muted">
            Showing {folderNames.length} folder{folderNames.length !== 1 ? 's' : ''}: {folderNames.join(', ')}
          </small>
        </div>
      </div>
    </div>
  );
};

export default FolderOverviewChart;