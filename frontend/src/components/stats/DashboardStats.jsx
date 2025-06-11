// src/components/stats/DashboardStats.jsx
import { useEffect, useState } from 'react';
import useReview from '../../hooks/useReview';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import StatsCard from './StatsCard';

const DashboardStats = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const { getDashboardStats, loading, error, clearError } = useReview();

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const stats = await getDashboardStats();
        setDashboardData(stats.data || stats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    };

    loadDashboardStats();
  }, [getDashboardStats]);

  if (loading) {
    return <LoadingSpinner message="Loading stats..." />;
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No study data available yet</p>
      </div>
    );
  }

  return (
    <div>
      <ErrorMessage error={error} onClose={clearError} />
      
      <div className="row g-3">
        <div className="col-md-4">
          <StatsCard
            title="Due Today"
            value={dashboardData.cards_due_today || 0}
            subtitle="Cards to review"
            icon="calendar-check"
            color="danger"
          />
        </div>
        <div className="col-md-4">
          <StatsCard
            title="This Week"
            value={dashboardData.cards_due_this_week || 0}
            subtitle="Cards coming up"
            icon="calendar-week"
            color="warning"
          />
        </div>
        <div className="col-md-4">
          <StatsCard
            title="This Month"
            value={dashboardData.cards_due_this_month || 0}
            subtitle="Total in pipeline"
            icon="calendar-month"
            color="info"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;