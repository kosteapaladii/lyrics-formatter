export const saveLyrics = (lyrics) => {
  const stored = JSON.parse(localStorage.getItem('savedLyrics') || '[]');
  const existingIndex = stored.findIndex(item => item.title === lyrics.title);
  
  const lyricsWithTimestamp = {
    ...lyrics,
    lastModified: Date.now()
  };
  
  if (existingIndex >= 0) {
    stored[existingIndex] = lyricsWithTimestamp;
  } else {
    stored.push(lyricsWithTimestamp);
  }
  
  localStorage.setItem('savedLyrics', JSON.stringify(stored));
};

export const getSavedLyrics = () => {
  return JSON.parse(localStorage.getItem('savedLyrics') || '[]');
};

export const deleteLyrics = (title) => {
  const stored = JSON.parse(localStorage.getItem('savedLyrics') || '[]');
  const filtered = stored.filter(item => item.title !== title);
  localStorage.setItem('savedLyrics', JSON.stringify(filtered));
};
