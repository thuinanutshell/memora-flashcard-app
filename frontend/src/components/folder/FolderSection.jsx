import { Container } from 'react-bootstrap';
import FolderList from '../folder/FolderList';

function FolderSection({ folders, onCreateFolder, onEditFolder, onDeleteFolder, onFolderClick }) {
  return (
    <section>
      <Container className="mb-4">
        <FolderList
          folders={folders}
          onCreateFolder={onCreateFolder}
          onEditFolder={onEditFolder}
          onDeleteFolder={onDeleteFolder}
          onFolderClick={onFolderClick}
        />
      </Container>
    </section>
  );
}

export default FolderSection;
