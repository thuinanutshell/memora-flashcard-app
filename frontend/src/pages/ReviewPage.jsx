// src/pages/ReviewPage.jsx
import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DeckReviewList from '../components/review/DeckReviewList';
import useFolders from '../hooks/useFolders';

const ReviewPage = () => {
  const [foldersWithDecks, setFoldersWithDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchFolders, getFolder } = useFolders();

  const clearError = () => setError(null);

  useEffect(() => {
    const loadFoldersWithDecks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get the list of all folders
        const foldersResponse = await fetchFolders();
        const folders = foldersResponse.data || foldersResponse;
        
        console.log('Basic folders:', folders);
        
        // Then get detailed data for each folder (including decks)
        const foldersWithDecksData = await Promise.all(
          folders.map(async (folder) => {
            try {
              const detailResponse = await getFolder(folder.id || folder._id);
              const detailedFolder = detailResponse.data?.folder || detailResponse.folder || detailResponse;
              
              console.log(`Detailed folder ${folder.name}:`, detailedFolder);
              
              // IMPORTANT: Make sure to preserve the decks array
              return {
                id: detailedFolder.id || detailedFolder._id,
                name: detailedFolder.name,
                description: detailedFolder.description,
                decks: detailedFolder.decks || [],  // This should have the decks!
                cardCount: detailedFolder.cardCount,
                deckCount: detailedFolder.deckCount
              };
            } catch (error) {
              console.error(`Error loading folder ${folder.name}:`, error);
              // Return folder without decks if individual folder fetch fails
              return {
                id: folder.id || folder._id,
                name: folder.name,
                description: folder.description,
                decks: []
              };
            }
          })
        );
        
        console.log('Final folders with decks (before setting state):', foldersWithDecksData);
        
        // Debug: Check each folder's decks
        foldersWithDecksData.forEach((folder, i) => {
          console.log(`Final folder ${i} "${folder.name}":`, folder);
          console.log(`Final folder ${i} decks:`, folder.decks);
          console.log(`Final folder ${i} decks length:`, folder.decks?.length);
        });
        
        setFoldersWithDecks(foldersWithDecksData);
        
      } catch (error) {
        console.error('Error loading folders:', error);
        setError(error.message || 'Failed to load folders');
      } finally {
        setLoading(false);
      }
    };

    loadFoldersWithDecks();
  }, [fetchFolders, getFolder]);

  if (loading) {
    return <LoadingSpinner message="Loading review options..." />;
  }

  return (
    <DeckReviewList
      folders={foldersWithDecks}
      loading={loading}
      error={error}
      clearError={clearError}
    />
  );
};

export default ReviewPage;