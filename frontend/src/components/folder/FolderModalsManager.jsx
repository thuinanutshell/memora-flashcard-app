import CreateFolderModal from './CreateFolderModal';
import DeleteFolderModal from './DeleteFolderModal';
import EditFolderModal from './EditFolderModal';

function FolderModalsManager({
  showCreateModal,
  showEditModal,
  showDeleteModal,
  selectedFolder,
  onCloseModal,
  onFolderCreated,
  onFolderUpdated,
  onFolderDeleted
}) {
  return (
    <>
      <CreateFolderModal
        show={showCreateModal}
        onHide={() => onCloseModal("create")}
        onFolderCreated={onFolderCreated}
      />

      <EditFolderModal
        show={showEditModal}
        onHide={() => onCloseModal("edit")}
        folder={selectedFolder}
        onFolderUpdated={onFolderUpdated}
      />

      <DeleteFolderModal
        show={showDeleteModal}
        onHide={() => onCloseModal("delete")}
        folder={selectedFolder}
        onFolderDeleted={onFolderDeleted}
      />
    </>
  );
}

export default FolderModalsManager;
