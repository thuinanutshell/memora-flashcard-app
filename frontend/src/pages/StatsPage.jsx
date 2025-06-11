// src/pages/StatsPage.jsx
import { useState } from 'react';
import DashboardStats from '../components/stats/DashboardStats';
import GeneralStats from '../components/stats/GeneralStats';

const StatsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Study Statistics</h2>
      </div>

      {/* Simple Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'overview' && <GeneralStats />}
      {activeTab === 'dashboard' && <DashboardStats />}
    </div>
  );
};

export default StatsPage;