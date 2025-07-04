import { CheckCircle, Clock, Edit, FileText, Trash2 } from 'lucide-react';
import Button from '../common/Button';

const CardList = ({ cards, onEdit, onDelete, onReview }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No cards in this deck yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map((card, index) => (
        <div key={card.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                Card {index + 1}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                card.difficulty_level === 'easy' 
                  ? 'bg-green-100 text-green-800' 
                  : card.difficulty_level === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {card.difficulty_level}
              </span>
              <span className={`text-xs px-2 py-1 rounded flex items-center ${
                card.is_fully_reviewed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {card.is_fully_reviewed ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mastered
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Learning ({card.review_count || 0}/3)
                  </>
                )}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit && onEdit(card)}
                className="flex items-center"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete && onDelete(card)}
                className="flex items-center text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question:
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                {card.question}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer:
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                {card.answer}
              </p>
            </div>
          </div>

          {/* Card Stats */}
          {card.last_reviewed_at && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Last reviewed: {new Date(card.last_reviewed_at).toLocaleDateString()}
                {card.next_review_at && (
                  <span className="ml-4">
                    Next review: {new Date(card.next_review_at).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CardList;