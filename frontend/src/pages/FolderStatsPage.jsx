// src/pages/FolderStatsPage.jsx
import { Link } from 'react-router-dom';
import FolderStats from '../components/stats/FolderStats';

const FolderStatsPage = () => {
  return (
    <div className="container-fluid">
      <nav className="mb-4">
        <Link to="/stats" className="btn btn-link p-0">
          ← Back to All Statistics
        </Link>
      </nav>

      <FolderStats />
    </div>
  );
};

export default FolderStatsPage;