// src/components/stats/FolderDeckChart.jsx
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useReview from '../../hooks/useReview';

const FolderDeckChart = ({ availableFolders = [] }) => {
  const [selectedFolder, setSelectedFolder] = useState('');
  const [folderStatsData, setFolderStatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getFolderStats } = useReview();

  // Color palette for different deck lines
  const colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6c757d'
  ];

  // Fetch folder stats when folder is selected
  useEffect(() => {
    if (selectedFolder && selectedFolder !== '') {
      setLoading(true);
      setError(null);
      
      // Extract folder ID from the selectedFolder value (assuming format "folderName|folderId")
      const folderId = selectedFolder.split('|')[1];
      
      getFolderStats(folderId)
        .then(response => {
          setFolderStatsData(response.data || response);
        })
        .catch(err => {
          console.error('Error fetching folder stats:', err);
          setError(err.message);
          setFolderStatsData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setFolderStatsData(null);
    }
  }, [selectedFolder, getFolderStats]);

  // Process deck data for line chart
  const { chartData, deckNames } = useMemo(() => {
    if (!folderStatsData?.accuracy_graph || typeof folderStatsData.accuracy_graph !== 'object') {
      return { chartData: [], deckNames: [] };
    }

    const deckData = folderStatsData.accuracy_graph;
    const deckMap = new Map();
    const allTimestamps = new Set();

    // Process each deck's data
    Object.keys(deckData).forEach(deckName => {
      const deckReviews = deckData[deckName];
      
      if (Array.isArray(deckReviews)) {
        deckReviews.forEach(item => {
          const timestamp = new Date(item.timestamp).getTime();
          
          if (!deckMap.has(deckName)) {
            deckMap.set(deckName, new Map());
          }
          
          deckMap.get(deckName).set(timestamp, item.score);
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
  }, [folderStatsData]);

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

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title mb-0">Deck Performance Analysis</h6>
          
          {/* Folder Selection */}
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a folder</option>
            {availableFolders.map(folder => (
              <option key={folder.id} value={`${folder.name}|${folder.id}`}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>Loading deck performance data...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <small>Error loading folder data: {error}</small>
          </div>
        )}

        {/* Chart */}
        {!loading && !error && selectedFolder && chartData.length > 0 ? (
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
                
                {/* Render a line for each deck */}
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
        ) : !loading && !error && selectedFolder && chartData.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">No deck data available for this folder</p>
          </div>
        ) : !loading && !error && !selectedFolder ? (
          <div className="text-center py-4">
            <p className="text-muted">Select a folder to view deck performance trends</p>
          </div>
        ) : null}

        {/* Chart Info */}
        {!loading && selectedFolder && deckNames.length > 0 && (
          <div className="mt-3">
            <small className="text-muted">
              Showing {deckNames.length} deck{deckNames.length !== 1 ? 's' : ''} in "{selectedFolder.split('|')[0]}": {deckNames.join(', ')}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderDeckChart;