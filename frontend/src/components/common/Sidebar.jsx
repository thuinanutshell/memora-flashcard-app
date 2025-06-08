import { Button, Card, ListGroup, Nav } from 'react-bootstrap';
import {
    BarChartFill,
    BookFill,
    BoxArrowRight,
    HouseDoorFill
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Card 
      className="h-100 d-flex flex-column" 
      style={{ width: '250px', borderRadius: 0 }}
    >
      <Card.Body className="d-flex flex-column p-3">
        {/* User Profile Section */}
        {user && (
          <div className="d-flex align-items-center mb-4 p-2 bg-light rounded">
            <div 
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center" 
              style={{ width: '40px', height: '40px', color: 'white' }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="ms-3">
              <div className="fw-bold">{user.username}</div>
              <small className="text-muted">Free Account</small>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <Nav className="flex-column">
          <ListGroup variant="flush">
            <ListGroup.Item 
              action 
              onClick={() => handleNavigation('/dashboard')}
              className="d-flex align-items-center py-3 border-0"
            >
              <HouseDoorFill className="me-3" />
              <span>Home</span>
            </ListGroup.Item>
            
            <ListGroup.Item 
              action 
              onClick={() => handleNavigation('/study')}
              className="d-flex align-items-center py-3 border-0"
            >
              <BookFill className="me-3" />
              <span>Study</span>
            </ListGroup.Item>
            
            <ListGroup.Item 
              action 
              onClick={() => handleNavigation('/stats')}
              className="d-flex align-items-center py-3 border-0"
            >
              <BarChartFill className="me-3" />
              <span>My Stats</span>
            </ListGroup.Item>
          </ListGroup>
        </Nav>

        {/* Spacer to push logout to bottom */}
        <div className="flex-grow-1"></div>

        {/* Logout Button */}
        <Button 
          variant="outline-danger" 
          className="d-flex align-items-center justify-content-center"
          onClick={handleLogout}
        >
          <BoxArrowRight className="me-2" />
          Logout
        </Button>
      </Card.Body>
    </Card>
  );
}

export default Sidebar;