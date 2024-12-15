import React, { useState, useEffect } from 'react';

const MUSICAL_KEYS = [
  'C Major', 'D Major', 'E Major', 'F Major', 'G Major', 'A Major', 'B Major',
  'C Minor', 'D Minor', 'E Minor', 'F Minor', 'G Minor', 'A Minor', 'B Minor'
];

const ExtraSection = ({ section, index, isEditMode, onUpdate }) => {
  const [localContent, setLocalContent] = useState(section.content);
  const [linkTitle, setLinkTitle] = useState(section.linkTitle || '');

  useEffect(() => {
    setLocalContent(section.content);
  }, [section.content]);

  const handleBlur = () => {
    onUpdate(index, { 
      content: localContent,
      linkTitle: section.extraType === 'link' ? linkTitle : undefined
    });
  };

  const renderContent = () => {
    switch (section.extraType) {
      case 'embed':
        return isEditMode ? (
          <textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            onBlur={handleBlur}
            placeholder="Paste embed code here"
            className="w-full p-2 border rounded font-mono text-sm h-24"
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: section.content }} />
        );

      case 'link':
        return isEditMode ? (
          <div className="space-y-2">
            <input
              type="url"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              onBlur={handleBlur}
              placeholder="Enter URL"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              onBlur={handleBlur}
              placeholder="Link Title (optional)"
              className="w-full p-2 border rounded"
            />
          </div>
        ) : (
          <a 
            href={section.content} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline"
          >
            {section.linkTitle || section.content}
          </a>
        );

      case 'bpm':
        return isEditMode ? (
          <input
            type="number"
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            onBlur={handleBlur}
            placeholder="Enter BPM"
            className="w-full p-2 border rounded"
            min="1"
            max="999"
          />
        ) : (
          <span className="text-lg">BPM: {section.content}</span>
        );

      case 'key':
        return isEditMode ? (
          <select
            value={localContent}
            onChange={(e) => {
              setLocalContent(e.target.value);
              onUpdate(index, { content: e.target.value });
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Key</option>
            {MUSICAL_KEYS.map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        ) : (
          <span className="text-lg">Key: {section.content}</span>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full border rounded-lg ${
      isEditMode ? 'focus:outline-none focus:ring-1 focus:ring-gray-300' : 'border-transparent bg-gray-50'
    }`}>
      {renderContent()}
    </div>
  );
};

export default ExtraSection;
