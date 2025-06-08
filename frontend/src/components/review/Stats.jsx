import { useEffect, useState } from 'react';
import { Alert, Card, Col, Container, Nav, Row, Spinner, Tab } from 'react-bootstrap';
import {
    Alarm,
    Book, CheckCircle,
    GraphUp,
    Star,
    Trophy
} from 'react-bootstrap-icons';
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';
import { getAllFolders } from '../../api/folderApi';
import { getFolderStats, getGeneralStats } from '../../api/reviewApi';
import useAuth from '../../hooks/useAuth';

function Stats() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generalStats, setGeneralStats] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [folderStats, setFolderStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [token]);

  useEffect(() => {
    if (selectedFolderId) {
      fetchFolderStats(selectedFolderId);
    }
  }, [selectedFolderId, token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch general stats
      const stats = await getGeneralStats(token);
      setGeneralStats(stats);

      // Fetch folders for folder-specific stats
      const folderList = await getAllFolders(token);
      setFolders(folderList);

      // Select first folder by default if available
      if (folderList.length > 0) {
        setSelectedFolderId(folderList[0].id);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderStats = async (folderId) => {
    try {
      const stats = await getFolderStats(token, folderId);
      setFolderStats(stats);
    } catch (err) {
      console.error('Error fetching folder stats:', err);
      // Don't set error here to not hide general stats
    }
  };

  const formatAccuracyData = (accuracyGraph) => {
    if (!accuracyGraph) return [];
    
    // Flatten all data points from all folders/decks
    const allDataPoints = [];
    
    Object.entries(accuracyGraph).forEach(([name, data]) => {
      data.forEach(point => {
        allDataPoints.push({
          timestamp: new Date(point.timestamp),
          score: point.score,
          name: name
        });
      });
    });

    // Sort by timestamp
    allDataPoints.sort((a, b) => a.timestamp - b.timestamp);

    // Group by date and calculate average
    const groupedByDate = {};
    allDataPoints.forEach(point => {
      const dateKey = point.timestamp.toLocaleDateString();
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(point.score);
    });

    // Calculate averages and format for chart
    return Object.entries(groupedByDate).map(([date, scores]) => ({
      date,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length
    }));
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return '#28a745'; // Green
    if (streak >= 7) return '#ffc107'; // Yellow
    if (streak >= 1) return '#17a2b8'; // Blue
    return '#6c757d'; // Gray
  };

  const getAccuracyColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  const accuracyData = formatAccuracyData(generalStats?.accuracy_graph);
  const pieData = [
    { 
      name: 'Fully Reviewed', 
      value: generalStats?.fully_reviewed_cards || 0,
      color: '#28a745'
    },
    { 
      name: 'In Progress', 
      value: folders.reduce((total, folder) => 
        total + (folder.decks?.reduce((deckTotal, deck) => 
          deckTotal + (deck.cards || 0), 0) || 0), 0
      ) - (generalStats?.fully_reviewed_cards || 0),
      color: '#17a2b8'
    }
  ];

  return (
    <Container className="p-4" style={{ maxWidth: '1400px', overflowY: 'auto' }}>
      <h1 className="mb-4">My Statistics</h1>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Overview Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <CheckCircle size={40} className="text-success mb-3" />
                <h2>{generalStats?.fully_reviewed_cards || 0}</h2>
                <p className="text-muted mb-0">Cards Mastered</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <Alarm 
                  size={40} 
                  className="mb-3"
                  style={{ color: getStreakColor(generalStats?.study_streak || 0) }}
                />
                <h2>{generalStats?.study_streak || 0} days</h2>
                <p className="text-muted mb-0">Study Streak</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <Star 
                  size={40} 
                  className="mb-3"
                  style={{ color: getAccuracyColor(generalStats?.average_score || 0) }}
                />
                <h2>{generalStats?.average_score?.toFixed(1) || 0}%</h2>
                <p className="text-muted mb-0">Average Accuracy</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <Book size={40} className="text-primary mb-3" />
                <h2>{folders.length || 0}</h2>
                <p className="text-muted mb-0">Active Folders</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <GraphUp className="me-2" />
                  Accuracy Over Time
                </h5>
              </Card.Header>
              <Card.Body>
                {accuracyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={accuracyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => `${value.toFixed(1)}%`}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        stroke="#8884d8" 
                        name="Average Score"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted py-5">
                    <GraphUp size={48} className="mb-3" />
                    <p>No review data available yet. Start studying to see your progress!</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <Trophy className="me-2" />
                  Progress Overview
                </h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Folder-specific Stats */}
        {folders.length > 0 && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Folder Performance</h5>
            </Card.Header>
            <Card.Body>
              <Tab.Container 
                id="folder-tabs" 
                defaultActiveKey={folders[0]?.id}
                onSelect={(k) => setSelectedFolderId(k)}
              >
                <Nav variant="tabs" className="mb-3">
                  {folders.map(folder => (
                    <Nav.Item key={folder.id}>
                      <Nav.Link eventKey={folder.id}>
                        {folder.name}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
                
                <Tab.Content>
                  {folders.map(folder => (
                    <Tab.Pane eventKey={folder.id} key={folder.id}>
                      {folderStats && folderStats.folder_name === folder.name && (
                        <Row>
                          <Col md={12}>
                            <Row className="mb-3">
                              <Col md={4}>
                                <Card className="text-center">
                                  <Card.Body>
                                    <h6>Average Score</h6>
                                    <h3>{folderStats.average_score?.toFixed(1) || 0}%</h3>
                                  </Card.Body>
                                </Card>
                              </Col>
                              <Col md={4}>
                                <Card className="text-center">
                                  <Card.Body>
                                    <h6>Cards Mastered</h6>
                                    <h3>{folderStats.fully_reviewed_cards || 0}</h3>
                                  </Card.Body>
                                </Card>
                              </Col>
                              <Col md={4}>
                                <Card className="text-center">
                                  <Card.Body>
                                    <h6>Study Streak</h6>
                                    <h3>{folderStats.study_streak || 0} days</h3>
                                  </Card.Body>
                                </Card>
                              </Col>
                            </Row>
                            
                            {/* Deck-by-deck accuracy chart */}
                            {folderStats.accuracy_graph && 
                             Object.keys(folderStats.accuracy_graph).length > 0 && (
                              <Card>
                                <Card.Header>
                                  <h6 className="mb-0">Deck Performance</h6>
                                </Card.Header>
                                <Card.Body>
                                  <ResponsiveContainer width="100%" height={250}>
                                    <LineChart>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="timestamp" />
                                      <YAxis domain={[0, 100]} />
                                      <Tooltip />
                                      <Legend />
                                      {Object.entries(folderStats.accuracy_graph).map(([deckName, data], index) => (
                                        <Line
                                          key={deckName}
                                          type="monotone"
                                          data={data}
                                          dataKey="score"
                                          name={deckName}
                                          stroke={`hsl(${index * 60}, 70%, 50%)`}
                                          strokeWidth={2}
                                        />
                                      ))}
                                    </LineChart>
                                  </ResponsiveContainer>
                                </Card.Body>
                              </Card>
                            )}
                          </Col>
                        </Row>
                      )}
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        )}
      </Container>
  );
}

export default Stats;