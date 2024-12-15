import React, { useState, useEffect, useRef } from 'react';
import PDFGenerator from './components/PDFGenerator';
import SidePanel from './components/SidePanel';
import { getSavedLyrics } from './utils/storage';

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [savedLyrics, setSavedLyrics] = useState([]);
  const pdfGeneratorRef = useRef();
  const [touchStart, setTouchStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const loadSavedLyrics = () => {
    setSavedLyrics(getSavedLyrics());
  };

  const handleLyricsSelect = (lyrics) => {
    pdfGeneratorRef.current?.loadLyrics(lyrics);
    setIsPanelOpen(false); // Close panel after selection
  };

  const handleNew = () => {
    pdfGeneratorRef.current?.loadLyrics({
      title: '',
      beatLink: '',
      sections: [{ type: 'text', content: '' }]
    });
    setIsPanelOpen(false); // Close panel after creating new
  };

  useEffect(() => {
    loadSavedLyrics();
  }, []);

  // Touch handlers
  const handleTouchStart = (e) => {
    if (e.touches[0].clientX < 20) { // Only trigger near the edge
      setDragStart(e.touches[0].clientX);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!dragStart || !isDragging) return;
    
    const currentX = e.touches[0].clientX;
    handleDragMove(currentX);
  };

  // Mouse handlers
  const handleMouseDown = (e) => {
    if (e.clientX < 20) {
      setDragStart(e.clientX);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!dragStart || !isDragging) return;
    
    const currentX = e.clientX;
    handleDragMove(currentX);
  };

  const handleDragEnd = () => {
    setDragStart(null);
    setIsDragging(false);
  };

  // Common drag logic
  const handleDragMove = (currentX) => {
    const diff = currentX - dragStart;
    
    if (diff > 50) { // Threshold to open panel
      setIsPanelOpen(true);
      setIsDragging(false);
      setDragStart(null);
    }
  };

  useEffect(() => {
    // Add mouse move and up listeners to window for drag outside component
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, dragStart]);

  const DotIndicator = () => (
    <button
      onClick={() => setIsPanelOpen(true)}
      className="md:hidden fixed top-2 left-2 w-2 h-2 bg-red-500 rounded-full z-50 animate-pulse"
      title="Open Menu"
    />
  );

  const MenuButton = ({ onClick, isOpen }) => (
    <button
      onClick={onClick}
      className={`fixed top-4 left-4 z-50 p-2 rounded-lg transition-all duration-300 transform 
        ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:scale-110'} 
        bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg hover:shadow-xl
        group flex items-center justify-center w-12 h-12 hidden md:flex`} // Hide on mobile
      title="Open Menu"
    >
      <div className="space-y-1.5 w-6">
        <span className="block h-0.5 w-full bg-white transform transition-transform duration-300 group-hover:translate-y-0.5"></span>
        <span className="block h-0.5 w-4/5 bg-white transform transition-all duration-300 group-hover:w-full"></span>
        <span className="block h-0.5 w-2/3 bg-white transform transition-all duration-300 group-hover:w-full"></span>
      </div>
    </button>
  );

  return (
    <div className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      style={{ touchAction: 'pan-y' }} // Prevent touch conflict with vertical scroll
    >
      {/* Show visual drag indicator when dragging */}
      {isDragging && (
        <div className="fixed inset-0 bg-gradient-to-r from-gray-900/10 to-transparent pointer-events-none z-40" />
      )}
      
      <DotIndicator />
      <MenuButton 
        onClick={() => setIsPanelOpen(!isPanelOpen)} 
        isOpen={isPanelOpen}
      />
      
      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        savedLyrics={savedLyrics}
        onLyricsSelect={handleLyricsSelect}
        onDelete={loadSavedLyrics}
        onNew={handleNew}
      />
      
      <main className={`transition-all duration-300 ${isPanelOpen ? 'md:pl-[280px]' : ''}`}>
        <PDFGenerator 
          ref={pdfGeneratorRef}
          onSave={loadSavedLyrics}
        />
      </main>
    </div>
  );
}

export default App;