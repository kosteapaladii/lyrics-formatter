import React from 'react';

const EditorToolbar = ({ isEditMode, onAddSection, onFormatMusixmatch, onToggleEditMode }) => {
  return (
    <div className="space-y-4">
      {isEditMode && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onAddSection('text')}
            className="px-4 py-2 bg-[#1b1b1b] text-white rounded-lg hover:bg-[#2b2b2b]"
          >
            + Add Text
          </button>
          <button
            type="button"
            onClick={() => onAddSection('refren')}
            className="px-4 py-2 bg-[#1b1b1b] text-white rounded-lg hover:bg-[#2b2b2b]"
          >
            + Add Refren
          </button>
          <button
            type="button"
            onClick={() => onAddSection('extra')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            + Add Extra
          </button>
        </div>
      )}
      
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-[#1b1b1b] text-white py-3 rounded-lg hover:bg-[#2b2b2b] flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Text
        </button>
        <button
          type="button"
          onClick={onFormatMusixmatch}
          className="flex-1 bg-[#8b5cf6] text-white py-3 rounded-lg hover:bg-[#7c3aed]"
        >
          Format for Musixmatch
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
