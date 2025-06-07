
const FolderDetails = ({ folder, onClose }) => {
  return (
    <div className="border p-4 rounded bg-white">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">{folder.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      {folder.description && (
        <div className="mb-4">
          <h3 className="font-medium text-gray-700">Description:</h3>
          <p className="text-gray-600">{folder.description}</p>
        </div>
      )}

      <div>
        <h3 className="font-medium text-gray-700 mb-2">
          Decks ({folder.decks?.length || 0})
        </h3>
        {folder.decks && folder.decks.length > 0 ? (
          <div className="space-y-2">
            {folder.decks.map((deck) => (
              <div key={deck.id} className="bg-gray-50 p-2 rounded">
                <h4 className="font-medium">{deck.name}</h4>
                {deck.description && (
                  <p className="text-sm text-gray-600">{deck.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No decks in this folder yet.</p>
        )}
      </div>
    </div>
  );
};

export default FolderDetails;