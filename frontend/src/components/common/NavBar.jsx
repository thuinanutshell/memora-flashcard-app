import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav style={{ padding: '1rem', background: '#eee' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      {!isAuthenticated ? (
        <>
          <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </nav>
  );
};

export default Navbar;