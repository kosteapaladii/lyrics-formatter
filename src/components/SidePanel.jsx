import React, { useState } from 'react';
import { deleteLyrics } from '../utils/storage';

const SidePanel = ({ isOpen, onClose, savedLyrics, onLyricsSelect, onDelete, onNew }) => {
  const [selectedLyrics, setSelectedLyrics] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelection = (title) => {
    setSelectedLyrics(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedLyrics.length} items?`)) {
      selectedLyrics.forEach(title => deleteLyrics(title));
      setSelectedLyrics([]);
      setIsSelectionMode(false);
      onDelete();
    }
  };

  return (
    <>
      {/* Backdrop with improved animation */}
      <div 
        className={`fixed inset-0 backdrop-blur-sm bg-black/20 transition-all duration-300 
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-40`}
        onClick={onClose}
      />
      
      {/* Panel with improved styling */}
      <div className={`fixed top-0 left-0 h-full w-[320px] max-w-[90vw] bg-gradient-to-br from-white to-gray-50 
        transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } z-50 overflow-hidden`}>
        
        {/* Header with new design */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 p-4 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Saved Lyrics
              </h2>
              {savedLyrics.length > 0 && (
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      setSelectedLyrics([]);
                    }}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isSelectionMode 
                        ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isSelectionMode ? "Cancel Selection" : "Select Multiple"}
                  >
                    {isSelectionMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onNew}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors transform hover:scale-105 duration-200"
                title="New Lyrics"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          {isSelectionMode && selectedLyrics.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-red-50 border-t border-red-100 transform translate-y-full animate-slide-up">
              <button
                onClick={handleBulkDelete}
                className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Selected ({selectedLyrics.length})
              </button>
            </div>
          )}
        </div>

        {/* Content with improved list items */}
        <div className="overflow-y-auto h-[calc(100vh-5rem)] p-4 space-y-2">
          {savedLyrics.sort((a, b) => b.lastModified - a.lastModified).map((lyrics, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-xl p-4 transition-all duration-200 
                ${isSelectionMode ? 'cursor-pointer hover:bg-gray-50' : 'hover:shadow-md'}
                ${selectedLyrics.includes(lyrics.title) ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
              `}
              onClick={() => {
                if (isSelectionMode) {
                  toggleSelection(lyrics.title);
                } else {
                  onLyricsSelect(lyrics);
                }
              }}
            >
              <div className="flex items-start gap-3">
                {isSelectionMode && (
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                    ${selectedLyrics.includes(lyrics.title) 
                      ? 'border-purple-500 bg-purple-500 text-white' 
                      : 'border-gray-300 group-hover:border-gray-400'
                    }`}
                  >
                    {selectedLyrics.includes(lyrics.title) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{lyrics.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {lyrics.sections.length} sections • {new Date(lyrics.lastModified).toLocaleDateString()}
                  </p>
                </div>
                {!isSelectionMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this?')) {
                        deleteLyrics(lyrics.title);
                        onDelete();
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SidePanel;
