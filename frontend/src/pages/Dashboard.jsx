import { useEffect, useState } from 'react';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAllFolders } from '../api/folderApi';
import { getDashboardStats, getGeneralStats } from '../api/reviewApi';
import DashboardStats from '../components/common/DashboardStats';
import FolderModalsManager from '../components/folder/FolderModalsManager';
import FolderSection from '../components/folder/FolderSection';
import useAuth from '../hooks/useAuth';

function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const normalizeFolder = (folder) => ({
    _id: folder._id || folder.id,
    id: folder.id || folder._id,
    name: folder.name || 'Untitled',
    description: folder.description || '',
    deckCount: folder.deckCount || 0,
    cardCount: folder.cardCount || 0
  });

  const updateFolderInList = (updatedFolder) => {
    setFolders(prev => {
      const currentFolders = Array.isArray(prev) ? prev : [];
      return currentFolders.map(folder => {
        const folderId = folder._id || folder.id;
        const updatedId = updatedFolder._id || updatedFolder.id;
        return folderId === updatedId ? normalizeFolder(updatedFolder) : folder;
      });
    });
  };

  const closeModal = (modalKey) => {
    if (modalKey === "create") setShowCreateModal(false);
    else if (modalKey === "edit") setShowEditModal(false);
    else if (modalKey === "delete") setShowDeleteModal(false);
    setSelectedFolder(null);
  };
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardResponse, generalStatsResponse, foldersResponse] = await Promise.all([
        getDashboardStats(token),
        getGeneralStats(token),
        getAllFolders(token)
      ]);

      setStats({
        cardsDue: dashboardResponse.cardsDue || 0,
        cardsReviewed: generalStatsResponse.totalReviews || 0
      });

      const foldersArray = Array.isArray(foldersResponse) ? foldersResponse : [];
      const formattedFolders = foldersArray.map(normalizeFolder);
      setFolders(formattedFolders);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderCreated = (newFolder) => {
    const formattedFolder = normalizeFolder(newFolder);
    setFolders(prev => [...prev, formattedFolder]);
    closeModal(setShowCreateModal);
  };

  const handleFolderClick = (folderId) => {
    navigate(`/folder/${folderId}`);
  };

  const handleEditFolder = (folder) => {
    setSelectedFolder(folder);
    setShowEditModal(true);
  };

  const handleDeleteFolder = (folder) => {
    setSelectedFolder(folder);
    setShowDeleteModal(true);
  };

  const handleFolderUpdated = (updatedFolder) => {
    updateFolderInList(updatedFolder);
    closeModal(setShowEditModal);
  };

  const handleFolderDeleted = (deletedFolderId) => {
    setFolders(prev => prev.filter(folder => (folder._id || folder.id) !== deletedFolderId));
    closeModal(setShowDeleteModal);
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Container className="d-flex justify-content-center align-items-center" style={{ flex: 1 }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Container style={{ flex: 1, padding: '20px' }}>
          <Alert variant="danger">
            <Alert.Heading>Error loading dashboard</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={fetchData}>
              Try Again
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <main style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', overflowY: 'auto', position: 'relative' }}>
        <Container className="py-4" style={{ backgroundColor: 'white', borderRadius: '8px' }}>
          <h1 className="mb-4">Welcome back{user?.username ? `, ${user.username}` : ''}!</h1>

          <DashboardStats stats={stats} />

          <FolderSection
            folders={folders}
            onCreateFolder={() => setShowCreateModal(true)}
            onFolderClick={handleFolderClick}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </Container>
      </main>

      <FolderModalsManager
        showCreateModal={showCreateModal}
        showEditModal={showEditModal}
        showDeleteModal={showDeleteModal}
        selectedFolder={selectedFolder}
        onCloseModal={closeModal}
        onFolderCreated={handleFolderCreated}
        onFolderUpdated={handleFolderUpdated}
        onFolderDeleted={handleFolderDeleted}
      />
    </div>
  );
}

export default Dashboard;
