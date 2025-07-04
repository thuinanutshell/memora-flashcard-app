import { BookOpen, FileText, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeckCard = ({ deck }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/deck/${deck.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{deck.name}</h3>
            {deck.description && (
              <p className="text-sm text-gray-600 mt-1">{deck.description}</p>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              console.log('More options clicked for deck:', deck.name);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-1" />
          <span>{deck.card_count || 0} cards</span>
        </div>
        <div>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {deck.card_count > 0 ? 'Active' : 'Empty'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeckCard;