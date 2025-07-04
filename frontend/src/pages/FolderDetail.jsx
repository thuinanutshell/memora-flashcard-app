import { ArrowLeft, Folder } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import DeckList from '../components/decks/DeckList';
import { useAuth } from '../context/AuthContext';
import { deckService } from '../services/deckService';

const FolderDetail = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [folder, setFolder] = useState(null);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFolderAndDecks();
  }, [folderId]);

  const loadFolderAndDecks = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await deckService.getDecksInFolder(folderId);
      if (result.success) {
        setFolder(result.folder);
        setDecks(result.decks);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load folder');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateDeck = async (deckData) => {
    const result = await deckService.createDeck(folderId, deckData);
    if (result.success) {
      setDecks(prev => [...prev, result.deck]);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-2">Loading folder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Navigation */}
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-900">Memora</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.full_name}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Folder Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Folder className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{folder?.name}</h2>
              {folder?.description && (
                <p className="text-gray-600 mt-1">{folder.description}</p>
              )}
            </div>
          </div>
          
          {/* Folder Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>{decks.length} decks</span>
            <span>{decks.reduce((total, deck) => total + (deck.card_count || 0), 0)} cards</span>
          </div>
        </div>

        {/* Deck Management */}
        <DeckList 
          folderId={folderId}
          decks={decks}
          onCreateDeck={handleCreateDeck}
          onDeckUpdate={loadFolderAndDecks}
        />
      </main>
    </div>
  );
};

export default FolderDetail;