import { Brain, FileText, Upload } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';

const GenerateCardsForm = ({ deckId, deckName, onGenerate, loading }) => {
  const [formData, setFormData] = useState({
    content: '',
    file: null,
    numCards: 5,
    difficulty: 'medium'
  });
  const [inputType, setInputType] = useState('text'); // 'text' or 'pdf'
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      file: file
    }));
    
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (inputType === 'text') {
      if (!formData.content.trim()) {
        newErrors.content = 'Please enter some content to generate cards from';
      } else if (formData.content.trim().length < 50) {
        newErrors.content = 'Content should be at least 50 characters long';
      }
    } else {
      if (!formData.file) {
        newErrors.file = 'Please select a PDF file';
      } else if (!formData.file.name.toLowerCase().endsWith('.pdf')) {
        newErrors.file = 'Only PDF files are supported';
      } else if (formData.file.size > 10 * 1024 * 1024) {
        newErrors.file = 'File size must be less than 10MB';
      }
    }
    
    if (formData.numCards < 1 || formData.numCards > 20) {
      newErrors.numCards = 'Number of cards must be between 1 and 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const generationData = {
      deckId: deckId,
      numCards: parseInt(formData.numCards),
      difficulty: formData.difficulty
    };
    
    if (inputType === 'text') {
      generationData.content = formData.content;
    } else {
      generationData.file = formData.file;
    }
    
    await onGenerate(generationData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generate Cards with AI
        </h3>
        <p className="text-gray-600">
          Creating cards for: <span className="font-medium">{deckName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Input Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setInputType('text')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                inputType === 'text'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <FileText className={`h-6 w-6 mx-auto mb-2 ${
                inputType === 'text' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className="block text-sm font-medium">Text Content</span>
            </button>
            
            <button
              type="button"
              onClick={() => setInputType('pdf')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                inputType === 'pdf'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className={`h-6 w-6 mx-auto mb-2 ${
                inputType === 'pdf' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className="block text-sm font-medium">Upload PDF</span>
            </button>
          </div>
        </div>

        {/* Content Input */}
        {inputType === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content (Text) *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Paste your study material here... (e.g., lecture notes, textbook content, etc.)"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={6}
              disabled={loading}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.content.length} characters (minimum 50 required)
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload PDF File *
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
              errors.file ? 'border-red-300' : 'border-gray-300'
            }`}>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {formData.file ? formData.file.name : 'Choose a PDF file to upload'}
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="pdf-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Select PDF File
                </label>
              </div>
            </div>
            {errors.file && (
              <p className="mt-1 text-sm text-red-600">{errors.file}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Maximum file size: 10MB
            </p>
          </div>
        )}

        {/* Generation Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Number of Cards"
            name="numCards"
            type="number"
            min="1"
            max="20"
            value={formData.numCards}
            onChange={handleInputChange}
            error={errors.numCards}
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="flex items-center"
          >
            <Brain className="h-4 w-4 mr-2" />
            {loading ? 'Generating Cards...' : 'Generate Cards'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GenerateCardsForm;