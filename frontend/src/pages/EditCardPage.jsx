// src/pages/EditCardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditCardForm from '../components/cards/EditCardForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useCards from '../hooks/useCards';

const EditCardPage = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  
  const { getCard, updateCard, loading } = useCards();

  useEffect(() => {
    const loadCard = async () => {
      try {
        const cardData = await getCard(cardId);
        setCard(cardData.data.card);
      } catch (error) {
        console.error('Error loading card:', error);
      }
    };

    loadCard();
  }, [cardId, getCard]);

  const handleSubmit = async (cardData) => {
    await updateCard(cardId, cardData);
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!card) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="container-fluid">
      <nav className="mb-3">
        <button onClick={() => navigate(-1)} className="btn btn-link p-0">
          ← Back
        </button>
      </nav>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <EditCardForm
            card={card}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default EditCardPage;