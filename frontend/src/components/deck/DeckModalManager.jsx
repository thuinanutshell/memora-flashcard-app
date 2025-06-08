import CreateDeckModal from './CreateDeckModal';
import DeleteDeckModal from './DeleteDeckModal';
import EditDeckModal from './EditDeckModal';

function DeckModalsManager({
  showCreateModal,
  showEditModal,
  showDeleteModal,
  selectedDeck,
  folderId, // Add this prop
  onCloseModal,
  onDeckCreated,
  onDeckUpdated,
  onDeckDeleted
}) {
  return (
    <>
      <CreateDeckModal
        show={showCreateModal}
        onHide={() => onCloseModal("create")}
        onDeckCreated={onDeckCreated}
        folderId={folderId} // Pass folderId here
      />

      <EditDeckModal
        show={showEditModal}
        onHide={() => onCloseModal("edit")}
        deck={selectedDeck}
        onDeckUpdated={onDeckUpdated}
      />

      <DeleteDeckModal
        show={showDeleteModal}
        onHide={() => onCloseModal("delete")}
        deck={selectedDeck}
        onDeckDeleted={onDeckDeleted}
      />
    </>
  );
}

export default DeckModalsManager;