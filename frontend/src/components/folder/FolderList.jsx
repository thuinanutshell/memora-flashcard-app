import { useEffect, useState } from 'react';
import { getOneFolder } from '../../api/folderApi';
import useAuth from '../../hooks/useAuth';

const FolderDetail = ({ folder }) => {
  const { token } = useAuth();
  const [folderDetail, setFolderDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (folder?.id) {
      loadFolderDetail();
    }
  }, [folder]);

  const loadFolderDetail = async () => {
    try {
      const data = await getOneFolder(token, folder.id);
      setFolderDetail(data);
    } catch (error) {
      console.error('Error loading folder detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading folder details...</div>;

  if (!folderDetail) return <div>Folder not found.</div>;

  return (
    <div>
      <h3>Folder Details</h3>
      
      <div>
        <strong>Name:</strong> {folderDetail.name}
      </div>
      
      {folderDetail.description && (
        <div>
          <strong>Description:</strong> {folderDetail.description}
        </div>
      )}
      
      {folderDetail.created_at && (
        <div>
          <strong>Created:</strong> {new Date(folderDetail.created_at).toLocaleString()}
        </div>
      )}
      
      {folderDetail.updated_at && (
        <div>
          <strong>Updated:</strong> {new Date(folderDetail.updated_at).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default FolderDetail;