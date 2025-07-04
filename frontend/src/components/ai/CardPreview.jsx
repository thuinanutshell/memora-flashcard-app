import { Brain, Check, X } from 'lucide-react';
import Button from '../common/Button';

const CardPreview = ({ generatedData, onAccept, onReject, loading }) => {
  const { cards, metadata } = generatedData;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Cards Preview
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <Brain className="h-4 w-4 mr-1" />
            <span>AI Generated</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 space-x-4">
          <span>Generated: {cards.length} cards</span>
          <span>Difficulty: {metadata.difficulty}</span>
          <span>Source: {metadata.generation_method}</span>
          {metadata.source_filename && (
            <span>File: {metadata.source_filename}</span>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {cards.map((card, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Card {index + 1}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {card.difficulty_level}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question:
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {card.question}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer:
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {card.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onReject}
          disabled={loading}
          className="flex items-center"
        >
          <X className="h-4 w-4 mr-2" />
          Reject
        </Button>
        
        <Button
          onClick={onAccept}
          loading={loading}
          disabled={loading}
          className="flex items-center"
        >
          <Check className="h-4 w-4 mr-2" />
          {loading ? 'Saving Cards...' : `Accept & Save ${cards.length} Cards`}
        </Button>
      </div>
    </div>
  );
};

export default CardPreview;