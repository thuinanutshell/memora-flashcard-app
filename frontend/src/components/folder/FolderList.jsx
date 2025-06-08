import { Button, Card, Col, Row } from 'react-bootstrap';
import { FolderFill, PencilSquare, Plus, Trash } from 'react-bootstrap-icons';

function FolderList({ folders, onCreateFolder, onFolderClick, onEditFolder, onDeleteFolder }) {
  const handleActionClick = (e, action, folder) => {
    e.stopPropagation();
    if (action === 'edit' && onEditFolder) onEditFolder(folder);
    else if (action === 'delete' && onDeleteFolder) onDeleteFolder(folder);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Your Folders</h2>
        <Button 
          variant="primary"
          onClick={onCreateFolder}
          className="d-flex align-items-center"
        >
          <Plus className="me-2" size={16} />
          Add Folder
        </Button>
      </div>

      {folders && folders.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {folders.map((folder, index) => (
            <Col key={folder._id || folder.id || `folder-${index}`}>
              <Card 
                className="h-100 shadow-sm folder-card position-relative" 
                style={{ borderLeft: '4px solid #0d6efd', cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}
                onClick={() => onFolderClick && onFolderClick(folder._id || folder.id)}
                onMouseEnter={(e) => e.target.closest('.folder-card').style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.closest('.folder-card').style.transform = 'translateY(0)'}
              >
                <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditFolder(folder);
                    }}
                    title="Edit Folder"
                  >
                    <PencilSquare size={16} />
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder);
                    }}
                    title="Delete Folder"
                  >
                    <Trash size={16} />
                  </button>
                </div>

                <Card.Body className="pe-5">
                  <div className="d-flex align-items-start mb-3">
                    <FolderFill className="text-primary me-2 mt-1" size={20} />
                    <div className="flex-grow-1">
                      <Card.Title className="mb-1 h5">
                        {folder.name || 'Untitled Folder'}
                      </Card.Title>
                    </div>
                  </div>

                  <Card.Text className="text-muted mb-3" style={{ minHeight: '2.5rem' }}>
                    {folder.description || 'No description provided'}
                  </Card.Text>
                </Card.Body>

                <Card.Footer className="bg-transparent border-0 d-flex justify-content-between pt-0">
                  <small className="text-muted d-flex align-items-center">
                    <strong>{folder.deckCount || 0}</strong>
                    <span className="ms-1">deck{(folder.deckCount || 0) !== 1 ? 's' : ''}</span>
                  </small>
                  <small className="text-muted d-flex align-items-center">
                    <strong>{folder.cardCount || 0}</strong>
                    <span className="ms-1">card{(folder.cardCount || 0) !== 1 ? 's' : ''}</span>
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <FolderFill className="text-muted mb-3" size={48} />
            <Card.Text className="text-muted mb-3 h5">You don't have any folders yet.</Card.Text>
            <Card.Text className="text-muted mb-4">Create your first folder to organize your flashcard decks.</Card.Text>
            <Button variant="primary" onClick={onCreateFolder} className="d-flex align-items-center mx-auto">
              <Plus className="me-2" size={16} />
              Create Your First Folder
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default FolderList;