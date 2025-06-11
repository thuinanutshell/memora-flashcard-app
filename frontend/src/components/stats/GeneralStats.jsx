// src/components/stats/GeneralStats.jsx
import { useEffect, useState } from 'react';
import useReview from '../../hooks/useReview';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import FolderDeckChart from './FolderDeckChart';
import FolderOverviewChart from './FolderOverviewChart';
import StatsCard from './StatsCard';
import StudyStreak from './StudyStreak';

const GeneralStats = () => {
  const [statsData, setStatsData] = useState(null);
  const [availableFolders, setAvailableFolders] = useState([]);
  const { getGeneralStats, loading, error, clearError } = useReview();

  useEffect(() => {
    const loadGeneralStats = async () => {
      try {
        const stats = await getGeneralStats();
        setStatsData(stats.data || stats);
        
        // Extract available folders with real IDs from the backend
        const folderIdMapping = stats.data?.folder_id_mapping || stats.folder_id_mapping || {};
        
        if (Object.keys(folderIdMapping).length > 0) {
          const folders = Object.keys(folderIdMapping).map(folderName => ({
            id: folderIdMapping[folderName], // Use real folder ID from backend
            name: folderName
          }));
          
          setAvailableFolders(folders);
        }
      } catch (error) {
        console.error('Error loading general stats:', error);
      }
    };

    loadGeneralStats();
  }, [getGeneralStats]);

  if (loading) {
    return <LoadingSpinner message="Loading statistics..." />;
  }

  if (!statsData) {
    return (
      <div className="text-center py-5">
        <h4 className="text-muted">No statistics available</h4>
        <p className="text-muted">Start reviewing cards to see your progress!</p>
      </div>
    );
  }

  // Calculate total reviews from accuracy graph
  let totalReviews = 0;
  if (statsData.accuracy_graph) {
    Object.values(statsData.accuracy_graph).forEach(folderData => {
      totalReviews += folderData.length;
    });
  }

  return (
    <div>
      <ErrorMessage error={error} onClose={clearError} />
      
      {/* Main Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatsCard
            title="Average Score"
            value={`${statsData.average_score || 0}%`}
            subtitle="Overall accuracy"
            icon="trophy"
            color="success"
          />
        </div>
        <div className="col-md-3">
          <StatsCard
            title="Mastered Cards"
            value={statsData.fully_reviewed_cards || 0}
            subtitle="Cards completed"
            icon="check-circle"
            color="primary"
          />
        </div>
        <div className="col-md-3">
          <StatsCard
            title="Total Reviews"
            value={totalReviews || 0}
            subtitle="Reviews submitted"
            icon="card-checklist"
            color="info"
          />
        </div>
        <div className="col-md-3">
          <StudyStreak streak={statsData.study_streak || 0} />
        </div>
      </div>

      {/* Folder Overview Chart */}
      {statsData.accuracy_graph && Object.keys(statsData.accuracy_graph).length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <FolderOverviewChart 
              data={statsData.accuracy_graph} 
              title="Folder Performance Overview"
            />
          </div>
        </div>
      )}

      {/* Folder Deck Analysis Chart */}
      {availableFolders.length > 0 && (
        <div className="row">
          <div className="col-12">
            <FolderDeckChart 
              availableFolders={availableFolders}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralStats;