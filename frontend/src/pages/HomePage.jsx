// src/pages/HomePage.jsx (Updated)
import { Link } from 'react-router-dom';
import DashboardStats from '../components/stats/DashboardStats';
import { useAuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuthContext();

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-10">
          {/* Welcome Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center p-4">
              <h1 className="card-title display-6 fw-bold text-primary mb-3">
                Welcome back, {user?.full_name || user?.username}!
              </h1>
              <p className="card-text text-muted mb-4">
                Ready to continue your learning journey?
              </p>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="mb-4">
            <h4 className="mb-3">Today's Overview</h4>
            <DashboardStats />
          </div>
          
          {/* Quick Actions */}
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card bg-primary text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-folder-plus display-6 mb-3"></i>
                  <h5 className="card-title">Manage Content</h5>
                  <p className="card-text">Organize your flashcards</p>
                  <Link to="/folders" className="btn btn-light">
                    Go to Folders
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-play-circle display-6 mb-3"></i>
                  <h5 className="card-title">Start Studying</h5>
                  <p className="card-text">Review your flashcards</p>
                  <Link to="/review" className="btn btn-light">
                    Start Review
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-info text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-graph-up display-6 mb-3"></i>
                  <h5 className="card-title">View Progress</h5>
                  <p className="card-text">Track your performance</p>
                  <Link to="/stats" className="btn btn-light">
                    View Statistics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;