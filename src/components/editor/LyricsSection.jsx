import React from 'react';

const LyricsSection = ({ section, index, isEditMode, onUpdate, onMove, onRemove }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xl font-bold">
          {section.type === 'text' ? 'Text:' : 'Refren:'}
        </label>
        {isEditMode && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onMove(index, -1)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              title="Move Up"
            >↑</button>
            <button
              type="button"
              onClick={() => onMove(index, 1)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              title="Move Down"
            >↓</button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
              title="Remove Section"
            >×</button>
          </div>
        )}
      </div>
      <textarea
        value={section.content}
        onChange={(e) => onUpdate(index, e.target.value)}
        placeholder={`Enter your ${section.type} here...`}
        className={`w-full border rounded-lg p-4 min-h-[150px] ${
          isEditMode 
            ? 'focus:outline-none focus:ring-1 focus:ring-gray-300' 
            : 'border-transparent bg-gray-50'
        } font-mono`}
        readOnly={!isEditMode}
      />
    </div>
  );
};

export default LyricsSection;
