// src/components/stats/ProgressChart.jsx
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ProgressChart = ({ data, title, groupBy = null, onFolderStatsNeeded }) => {
  const [selectedFolder, setSelectedFolder] = useState('');
  const [folderData, setFolderData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Color palette for different deck lines
  const colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6c757d'
  ];

  // Extract available folders from the general data
  const folders = useMemo(() => {
    if (!data || typeof data !== 'object') return [];
    return Object.keys(data);
  }, [data]);

  // Handle folder selection and fetch folder-specific data
  useEffect(() => {
    if (selectedFolder && onFolderStatsNeeded) {
      setLoading(true);
      onFolderStatsNeeded(selectedFolder)
        .then(response => {
          // The response should contain accuracy_graph with deck data
          setFolderData(response.data?.accuracy_graph || response.accuracy_graph);
        })
        .catch(error => {
          console.error('Error fetching folder stats:', error);
          setFolderData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setFolderData(null);
    }
  }, [selectedFolder, onFolderStatsNeeded]);

  // Process data for line chart
  const { chartData, deckNames } = useMemo(() => {
    // Use folder-specific data if available, otherwise use general data
    const sourceData = selectedFolder && folderData ? folderData : data;
    
    if (!sourceData || typeof sourceData !== 'object') {
      return { chartData: [], deckNames: [] };
    }

    // Collect all data points and organize by deck/folder
    const deckMap = new Map();
    const allTimestamps = new Set();

    Object.keys(sourceData).forEach(key => {
      const items = sourceData[key];
      
      if (Array.isArray(items)) {
        items.forEach(item => {
          const timestamp = new Date(item.timestamp).getTime();
          
          if (!deckMap.has(key)) {
            deckMap.set(key, new Map());
          }
          
          deckMap.get(key).set(timestamp, item.score);
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

      // Add each deck's score for this timestamp (if it exists)
      deckMap.forEach((scores, deckName) => {
        dataPoint[deckName] = scores.get(timestamp) || null;
      });

      return dataPoint;
    });

    const deckNames = Array.from(deckMap.keys());
    return { chartData, deckNames };
  }, [data, selectedFolder, folderData]);

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
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title mb-0">{title}</h6>
          
          {/* Folder Filter */}
          {folders.length > 1 && (
            <select 
              className="form-select form-select-sm" 
              style={{ width: 'auto' }}
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              disabled={loading}
            >
              <option value="">All Folders</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          )}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>Loading deck data...</span>
          </div>
        )}

        {/* Chart */}
        {!loading && chartData.length > 0 ? (
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
                
                {/* Render a line for each deck/folder */}
                {deckNames.map((deckName, index) => (
                  <Line
                    key={deckName}
                    type="monotone"
                    dataKey={deckName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls={false}
                    name={deckName}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : !loading && (
          <div className="text-center py-5">
            <p className="text-muted">
              {selectedFolder 
                ? `No data available for "${selectedFolder}"`
                : "No chart data available"
              }
            </p>
          </div>
        )}

        {/* Chart Info */}
        {!loading && (
          <div className="mt-3">
            <small className="text-muted">
              {selectedFolder 
                ? `Showing ${deckNames.length} deck${deckNames.length !== 1 ? 's' : ''} in "${selectedFolder}": ${deckNames.join(', ')}`
                : `Showing ${deckNames.length} folder${deckNames.length !== 1 ? 's' : ''}: ${deckNames.join(', ')}`
              }
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;