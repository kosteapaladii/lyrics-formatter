import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { saveLyrics } from '../utils/storage';

const PDFGenerator = forwardRef(({ onSave }, ref) => {
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([
    { type: 'text', content: '' }
  ]);
  const [formattedText, setFormattedText] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);

  const MUSICAL_KEYS = [
    'C Major', 'D Major', 'E Major', 'F Major', 'G Major', 'A Major', 'B Major',
    'C Minor', 'D Minor', 'E Minor', 'F Minor', 'G Minor', 'A Minor', 'B Minor'
  ];

  // Add new state for edit mode in extra sections
  const [editingExtraIndex, setEditingExtraIndex] = useState(null);
  const [tempExtraContent, setTempExtraContent] = useState(null);

  // Add new helper function to separate extra sections from content sections
  const getSectionsByType = () => {
    const extraSections = sections.filter(section => section.type === 'extra');
    const contentSections = sections.filter(section => section.type !== 'extra');
    return { extraSections, contentSections };
  };

  const addSection = (type) => {
    if (type === 'extra') {
      // Add extra section at the beginning, after other extras
      const { extraSections, contentSections } = getSectionsByType();
      const newIndex = extraSections.length;
      setSections([...extraSections, { type, content: '', extraType: 'embed' }, ...contentSections]);
      // Automatically start editing the new section
      setTimeout(() => {
        setEditingExtraIndex(newIndex);
        setTempExtraContent('');
      }, 0);
    } else {
      setSections([...sections, { type, content: '' }]);
    }
  };

  const updateSection = (index, content) => {
    const newSections = [...sections];
    newSections[index].content = content;
    setSections(newSections);
  };

  const moveSection = (index, direction) => {
    const newSections = [...sections];
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < sections.length) {
      // Don't allow moving extra sections below content sections
      if (sections[index].type === 'extra') {
        const { extraSections } = getSectionsByType();
        if (newIndex >= extraSections.length) return;
      }
      // Don't allow moving content sections above extra sections
      if (sections[index].type !== 'extra') {
        const { extraSections } = getSectionsByType();
        if (newIndex < extraSections.length) return;
      }
      
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      setSections(newSections);
      saveCurrentLyrics();
    }
  };

  const removeSection = (index) => {
    if (sections.length > 1 && window.confirm('Are you sure you want to remove this section?')) {
      const newSections = sections.filter((_, i) => i !== index);
      setSections(newSections);
      saveCurrentLyrics();
    }
  };

  const formatForMusixmatch = () => {
    let formatted = '';
    sections.forEach((section) => {
      // Skip extra sections in Musixmatch format
      if (section.type !== 'extra') {
        formatted += `${section.type === 'text' ? 'Verse' : 'Chorus'}:\n`;
        formatted += `${section.content}\n\n`;
      }
    });
    setFormattedText(formatted);
    navigator.clipboard.writeText(formatted);
  };

  const downloadText = (e) => {
    e.preventDefault();
    
    // Save lyrics data
    const lyricsData = {
      title,
      sections,
    };
    saveLyrics(lyricsData);
    if (onSave) onSave();

    // Create formatted text content
    let textContent = `CAMEO - ${title}\n\n`;
    
    sections.forEach((section) => {
      if (section.type === 'extra') {
        // Include all extra sections except embeds
        if (section.extraType !== 'embed') {
          textContent += `${section.extraType.toUpperCase()}: ${section.content}\n`;
          if (section.extraType === 'link' && section.linkTitle) {
            textContent += `Link Title: ${section.linkTitle}\n`;
          }
          textContent += '\n';
        }
      } else {
        textContent += `${section.type === 'text' ? 'Verse' : 'Chorus'}:\n`;
        textContent += `${section.content}\n\n`;
      }
    });

    // Create and trigger download
    const element = document.createElement('a');
    const file = new Blob([textContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title || 'lyrics'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const saveCurrentLyrics = (skipExtras = false) => {
    if (title.trim()) {
      // If skipExtras is true, we'll preserve the existing extra sections
      const lyricsData = {
        title,
        sections: skipExtras ? sections.map(section => {
          if (section.type === 'extra') {
            // Find existing extra section with same content to preserve its state
            const existingExtra = sections.find(s => 
              s.type === 'extra' && 
              s.extraType === section.extraType && 
              s.content === section.content
            );
            return existingExtra || section;
          }
          return section;
        }) : sections,
      };
      
      saveLyrics(lyricsData);
      setHasUnsavedChanges(false);
      if (onSave) onSave();
    }
  };

  const handleTitleBlur = () => {
    saveCurrentLyrics(true);
  };

  const handleSectionBlur = () => {
    saveCurrentLyrics(true);
  };

  // Expose loadLyrics method to parent
  useImperativeHandle(ref, () => ({
    loadLyrics: (lyricsData) => {
      if (!lyricsData) return;
      setTitle(lyricsData.title);
      setSections(lyricsData.sections);
      setHasUnsavedChanges(false);
      setIsEditMode(false); // Exit edit mode when loading lyrics
    }
  }));

  const updateExtraSection = (index, updates) => {
    const newSections = [...sections];
    newSections[index] = { 
      ...newSections[index], 
      ...updates,
      isEditing: false 
    };
    setSections(newSections);
    saveCurrentLyrics(); // Save without skipping extras when updating extra sections
    setEditingExtraIndex(null);
    setTempExtraContent(null);
  };

  const startEditingExtra = (index) => {
    setEditingExtraIndex(index);
    setTempExtraContent(sections[index].content);
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Save changes when exiting edit mode
      saveCurrentLyrics();
    }
    setIsEditMode(!isEditMode);
  };

  const ExtraSection = ({ section, index }) => {
    const isEditing = editingExtraIndex === index && isEditMode;
    const [localContent, setLocalContent] = useState(section.content);
    const [linkTitle, setLinkTitle] = useState(section.linkTitle || '');
  
    useEffect(() => {
      setLocalContent(section.content);
    }, [section.content]);
  
    const handleBlur = () => {
      updateExtraSection(index, { 
        content: localContent,
        linkTitle: section.extraType === 'link' ? linkTitle : undefined
      });
    };
  
    return (
      <div className={`w-full border rounded-lg ${
        isEditMode ? 'focus:outline-none focus:ring-1 focus:ring-gray-300' : 'border-transparent bg-gray-50'
      }`}>
        {/* Content display/edit section */}
        {section.extraType === 'embed' && (
          isEditMode ? (
            <textarea
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              onBlur={handleBlur}
              placeholder="Paste embed code here"
              className="w-full p-2 border rounded font-mono text-sm h-24"
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
          )
        )}
        {section.extraType === 'link' && (
          isEditMode ? (
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
            <a href={section.content} target="_blank" rel="noopener noreferrer" 
              className="text-blue-500 hover:underline">
              {section.linkTitle || section.content}
            </a>
          )
        )}
        {section.extraType === 'bpm' && (
          isEditMode ? (
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
          )
        )}
        {section.extraType === 'key' && (
          isEditMode ? (
            <select
              value={localContent}
              onChange={(e) => {
                setLocalContent(e.target.value);
                // For select, we want to save immediately
                updateExtraSection(index, { content: e.target.value });
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
          )
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4 md:p-8">
        <form onSubmit={downloadText} className="space-y-4 md:space-y-6">
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3">
            <span className="text-2xl md:text-4xl font-bold whitespace-nowrap" style={{ fontFamily: "'Natural Precision', sans-serif" }}>CAMEO</span>
            <span className="text-2xl md:text-4xl text-gray-400">-</span>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Your Title"
              className={`flex-1 min-w-0 text-2xl md:text-4xl border-b ${
                isEditMode ? 'border-gray-300' : 'border-transparent'
              } focus:outline-none focus:border-gray-400 px-2 text-red-500`}
              style={{ fontFamily: "'Natural Precision', sans-serif" }}
              readOnly={!isEditMode}
            />
            <button
              type="button"
              onClick={toggleEditMode}
              className={`p-2 rounded-lg transition-colors ${
                isEditMode 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              title={isEditMode ? "Save & Exit Edit Mode" : "Enter Edit Mode"}
            >
              {isEditMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              )}
            </button>
          </div>

          {/* Group extra sections */}
          {sections.some(section => section.type === 'extra') && (
            <div className="space-y-2">
              {sections.map((section, index) => (
                section.type === 'extra' && (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      {isEditMode && (
                        <select
                          value={section.extraType}
                          onChange={(e) => updateExtraSection(index, { 
                            extraType: e.target.value,
                            content: '',
                            linkTitle: '' 
                          })}
                          className="px-3 py-1 border rounded text-xl font-bold"
                        >
                          <option value="embed">Embed</option>
                          <option value="bpm">BPM</option>
                          <option value="key">Key</option>
                          <option value="link">Link</option>
                        </select>
                      )}
                      {isEditMode && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => moveSection(index, -1)}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Move Up"
                          >↑</button>
                          <button
                            type="button"
                            onClick={() => moveSection(index, 1)}
                            disabled={index === sections.length - 1}
                            className={`p-1 rounded ${
                              index === sections.length - 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Move Down"
                          >↓</button>
                          <button
                            type="button"
                            onClick={() => removeSection(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Remove Section"
                          >×</button>
                        </div>
                      )}
                    </div>
                    <div className="w-full">
                      <ExtraSection section={section} index={index} />
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Regular sections */}
          {sections.map((section, index) => (
            section.type !== 'extra' && (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xl font-bold">
                    {section.type === 'text' ? 'Text:' : 'Refren:'}
                  </label>
                  {isEditMode && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveSection(index, -1)}
                        disabled={index === 0}
                        className={`p-1 rounded ${
                          index === 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Move Up"
                      >↑</button>
                      <button
                        type="button"
                        onClick={() => moveSection(index, 1)}
                        disabled={index === sections.length - 1}
                        className={`p-1 rounded ${
                          index === sections.length - 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Move Down"
                      >↓</button>
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Remove Section"
                      >×</button>
                    </div>
                  )}
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(index, e.target.value)}
                  onBlur={handleSectionBlur}
                  placeholder={`Enter your ${section.type} here...`}
                  className={`w-full border rounded-lg p-4 min-h-[150px] ${
                    isEditMode 
                      ? 'focus:outline-none focus:ring-1 focus:ring-gray-300' 
                      : 'border-transparent bg-gray-50'
                  } font-mono`}
                  readOnly={!isEditMode}
                />
              </div>
            )
          ))}

          {/* Only show action buttons in edit mode */}
          {isEditMode && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => addSection('text')}
                className="px-4 py-2 bg-[#1b1b1b] text-white rounded-lg hover:bg-[#2b2b2b]"
              >
                + Add Text
              </button>
              <button
                type="button"
                onClick={() => addSection('refren')}
                className="px-4 py-2 bg-[#1b1b1b] text-white rounded-lg hover:bg-[#2b2b2b]"
              >
                + Add Refren
              </button>
              <button
                type="button"
                onClick={() => addSection('extra')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                + Add Extra
              </button>
            </div>
          )}

          {/* Always show download and format buttons */}
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
              onClick={formatForMusixmatch}
              className="flex-1 bg-[#8b5cf6] text-white py-3 rounded-lg hover:bg-[#7c3aed]"
            >
              Format for Musixmatch
            </button>
          </div>

          {formattedText && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Formatted for Musixmatch:</h3>
              <pre className="bg-gray-50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap">
                {formattedText}
              </pre>
              <p className="text-sm text-gray-500 mt-2">
                Text has been copied to clipboard!
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
});

export default PDFGenerator;