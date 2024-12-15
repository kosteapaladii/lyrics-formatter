import { createGist, updateGist, listGists, getGist } from '../services/gistService';

export const saveLyrics = async (lyrics) => {
  try {
    // Save to local storage first
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
    
    // Then sync with GitHub Gists
    const gists = await listGists();
    if (gists.length === 0) {
      await createGist(stored);
    } else {
      await updateGist(gists[0].id, stored);
    }

    return stored;
  } catch (error) {
    console.error('Error syncing lyrics:', error);
    return JSON.parse(localStorage.getItem('savedLyrics') || '[]');
  }
};

export const getSavedLyrics = async () => {
  try {
    // Try to get from GitHub Gists first
    const gists = await listGists();
    if (gists.length > 0) {
      const gistData = await getGist(gists[0].id);
      // Update local storage with cloud data
      localStorage.setItem('savedLyrics', JSON.stringify(gistData));
      return gistData;
    }
  } catch (error) {
    console.error('Error getting lyrics from cloud:', error);
  }
  
  // Fallback to local storage
  return JSON.parse(localStorage.getItem('savedLyrics') || '[]');
};

export const deleteLyrics = (title) => {
  const stored = JSON.parse(localStorage.getItem('savedLyrics') || '[]');
  const filtered = stored.filter(item => item.title !== title);
  localStorage.setItem('savedLyrics', JSON.stringify(filtered));
};
