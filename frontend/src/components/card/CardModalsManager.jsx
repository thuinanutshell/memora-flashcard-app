import CreateCardModal from './CreateCardModal';
import DeleteCardModal from './DeleteCardModal';
import EditCardModal from './EditCardModal';

function CardModalsManager({
  showCreateModal,
  showEditModal,
  showDeleteModal,
  selectedCard,
  deckId,
  onCloseModal,
  onCardCreated,
  onCardUpdated,
  onCardDeleted
}) {
  const handleCloseModal = (modalType) => {
    if (onCloseModal) {
      onCloseModal(modalType);
    }
  };

  const handleCardCreated = (newCard) => {
    if (onCardCreated) {
      onCardCreated(newCard);
    }
    handleCloseModal('create');
  };

  const handleCardUpdated = (updatedCard) => {
    if (onCardUpdated) {
      onCardUpdated(updatedCard);
    }
    handleCloseModal('edit');
  };

  const handleCardDeleted = (deletedCard) => {
    if (onCardDeleted) {
      onCardDeleted(deletedCard);
    }
    handleCloseModal('delete');
  };

  return (
    <>
      {/* Create Card Modal */}
      <CreateCardModal
        show={showCreateModal}
        onHide={() => handleCloseModal('create')}
        onCardCreated={handleCardCreated}
        deckId={deckId}
      />

      {/* Edit Card Modal */}
      <EditCardModal
        show={showEditModal}
        onHide={() => handleCloseModal('edit')}
        card={selectedCard}
        onCardUpdated={handleCardUpdated}
      />

      {/* Delete Card Modal */}
      <DeleteCardModal
        show={showDeleteModal}
        onHide={() => handleCloseModal('delete')}
        card={selectedCard}
        onCardDeleted={handleCardDeleted}
      />
    </>
  );
}

export default CardModalsManager;