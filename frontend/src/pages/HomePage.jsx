import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <h1>Welcome {isAuthenticated ? user?.username : 'Guest'}</h1>
      
      {isAuthenticated ? (
        <div style={styles.authSection}>
          <p>You're logged in as <strong>{user?.email}</strong></p>
          <button onClick={handleLogout} style={styles.button}>
            Logout
          </button>
        </div>
      ) : (
        <div style={styles.authSection}>
          <p>Please log in or register to access all features</p>
          <div style={styles.buttonGroup}>
            <Link to="/login" style={styles.button}>
              Login
            </Link>
            <Link to="/register" style={styles.button}>
              Register
            </Link>
          </div>
        </div>
      )}

      <div style={styles.content}>
        <h2>Home Page Content</h2>
        <p>This is the main page of your application.</p>
        {isAuthenticated && (
          <p>You now have access to all the amazing features!</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    textAlign: 'center',
  },
  authSection: {
    margin: '2rem 0',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  content: {
    marginTop: '2rem',
    textAlign: 'left',
  },
};

export default HomePage;