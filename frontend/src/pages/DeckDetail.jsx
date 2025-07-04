import { ArrowLeft, BookOpen, Brain, FileText, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CardPreview from '../components/ai/CardPreview';
import GenerateCardsForm from '../components/ai/GenerateCardsForm';
import CardList from '../components/cards/CardList';
import CreateCardModal from '../components/cards/CreateCardModal';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';
import { cardService } from '../services/cardService';
import { deckService } from '../services/deckService';

const DeckDetail = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // AI Generation States
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generatingCards, setGeneratingCards] = useState(false);
  const [generatedCards, setGeneratedCards] = useState(null);
  const [savingCards, setSavingCards] = useState(false);
  
  // Manual Card Creation States
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);

  useEffect(() => {
    loadDeck();
  }, [deckId]);

  const loadDeck = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await deckService.getDeck(deckId);
      if (result.success) {
        setDeck(result.deck);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load deck');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleGenerateCards = async (generationData) => {
    console.log('Generation data:', generationData); // Debug log
    setGeneratingCards(true);
    setError('');

    try {
      const result = await aiService.generateCards(generationData);
      console.log('Generation result:', result); // Debug log
      if (result.success) {
        setGeneratedCards(result.data);
        setShowGenerateForm(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Generation error:', error); // Debug log
      setError('Failed to generate cards');
    } finally {
      setGeneratingCards(false);
    }
  };

  const handleAcceptCards = async () => {
    if (!generatedCards) return;

    setSavingCards(true);
    setError('');

    try {
      const result = await aiService.acceptCards(deckId, generatedCards.cards);
      if (result.success) {
        setGeneratedCards(null);
        await loadDeck(); // Reload deck to show new cards
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to save cards');
    } finally {
      setSavingCards(false);
    }
  };

  const handleRejectCards = () => {
    setGeneratedCards(null);
    setShowGenerateForm(true);
  };

  const handleCreateCard = async (cardData) => {
    const result = await cardService.createCard(deckId, cardData);
    if (result.success) {
      await loadDeck(); // Reload deck to show new card
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleEditCard = (card) => {
    // TODO: Implement edit card functionality
    console.log('Edit card:', card);
  };

  const handleDeleteCard = async (card) => {
    if (window.confirm(`Are you sure you want to delete this card: "${card.question}"?`)) {
      const result = await cardService.deleteCard(card.id);
      if (result.success) {
        await loadDeck(); // Reload deck to remove deleted card
      } else {
        setError(result.error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-2">Loading deck...</p>
        </div>
      </div>
    );
  }

  if (error && !deck) {
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
                onClick={() => navigate(-1)}
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
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Deck Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{deck?.name}</h2>
              {deck?.description && (
                <p className="text-gray-600 mt-1">{deck.description}</p>
              )}
            </div>
          </div>
          
          {/* Deck Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>{deck?.cards?.length || 0} cards</span>
            <span>{deck?.cards?.filter(card => card.is_fully_reviewed).length || 0} mastered</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            onClick={() => setShowGenerateForm(true)}
            className="flex items-center"
          >
            <Brain className="h-4 w-4 mr-2" />
            Generate Card
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowCreateCardModal(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add new card
          </Button>
        </div>

        {/* AI Generation Form */}
        {showGenerateForm && !generatedCards && (
          <div className="mb-8">
            <GenerateCardsForm
              deckId={deckId}
              deckName={deck?.name}
              onGenerate={handleGenerateCards}
              loading={generatingCards}
            />
          </div>
        )}

        {/* Generated Cards Preview */}
        {generatedCards && (
          <div className="mb-8">
            <CardPreview
              generatedData={generatedCards}
              onAccept={handleAcceptCards}
              onReject={handleRejectCards}
              loading={savingCards}
            />
          </div>
        )}

        {/* Existing Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cards in this Deck ({deck?.cards?.length || 0})
          </h3>
          
          {deck?.cards?.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No cards yet</h4>
              <p className="text-gray-600 mb-4">Generate or create your first card to get started</p>
              <div className="flex justify-center space-x-3">
                <Button onClick={() => setShowGenerateForm(true)}>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Cards with AI
                </Button>
                <Button variant="outline" onClick={() => setShowCreateCardModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Card Manually
                </Button>
              </div>
            </div>
          ) : (
            <CardList 
              cards={deck.cards}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          )}
        </div>

        {/* Create Card Modal */}
        {showCreateCardModal && (
          <CreateCardModal
            deckId={deckId}
            deckName={deck?.name}
            onClose={() => setShowCreateCardModal(false)}
            onSubmit={handleCreateCard}
          />
        )}
      </main>
    </div>
  );
};

export default DeckDetail;