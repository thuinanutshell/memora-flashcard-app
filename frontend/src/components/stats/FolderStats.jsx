// src/components/stats/FolderStats.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useReview from '../../hooks/useReview';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import ProgressChart from './ProgressChart';
import StatsCard from './StatsCard';

const FolderStats = () => {
  const { folderId } = useParams();
  const [statsData, setStatsData] = useState(null);
  const { getFolderStats, loading, error, clearError } = useReview();

  useEffect(() => {
    const loadFolderStats = async () => {
      try {
        const stats = await getFolderStats(folderId);
        setStatsData(stats.data || stats);
      } catch (error) {
        console.error('Error loading folder stats:', error);
      }
    };

    if (folderId) {
      loadFolderStats();
    }
  }, [folderId, getFolderStats]);

  if (loading) {
    return <LoadingSpinner message="Loading folder statistics..." />;
  }

  if (!statsData) {
    return (
      <div className="text-center py-5">
        <h4 className="text-muted">No statistics available</h4>
        <p className="text-muted">Start reviewing cards in this folder!</p>
      </div>
    );
  }

  return (
    <div>
      <ErrorMessage error={error} onClose={clearError} />
      
      <h3 className="mb-4">Statistics for "{statsData.folder_name}"</h3>
      
      {/* Folder Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatsCard
            title="Average Score"
            value={`${statsData.average_score || 0}%`}
            subtitle="Folder accuracy"
            icon="trophy"
            color="success"
          />
        </div>
        <div className="col-md-4">
          <StatsCard
            title="Mastered Cards"
            value={statsData.fully_reviewed_cards || 0}
            subtitle="In this folder"
            icon="check-circle"
            color="primary"
          />
        </div>
        <div className="col-md-4">
          <StatsCard
            title="Study Streak"
            value={`${statsData.study_streak || 0} days`}
            subtitle="For this folder"
            icon="fire"
            color="warning"
          />
        </div>
      </div>

      {/* Interactive Progress Chart by Deck */}
      {statsData.accuracy_graph && Object.keys(statsData.accuracy_graph).length > 0 && (
        <div className="row">
          <div className="col-12">
            <ProgressChart 
              data={statsData.accuracy_graph} 
              title="Progress by Deck in This Folder"
              groupBy="deck"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderStats;