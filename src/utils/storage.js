import { createGist, updateGist, listGists, getGist } from '../services/gistService';

export const saveLyrics = async (lyrics) => {
  try {
    const lyricsWithTimestamp = {
      ...lyrics,
      lastModified: Date.now()
    };

    // Try to sync with GitHub Gists first
    const gists = await listGists();
    if (gists.length === 0) {
      // If no gist exists, create new one
      await createGist([lyricsWithTimestamp]);
    } else {
      // Get existing lyrics from gist
      const existingLyrics = await getGist(gists[0].id);
      const updatedLyrics = Array.isArray(existingLyrics) ? existingLyrics : [];
      
      // Update or add new lyrics
      const existingIndex = updatedLyrics.findIndex(item => item.title === lyrics.title);
      if (existingIndex >= 0) {
        updatedLyrics[existingIndex] = lyricsWithTimestamp;
      } else {
        updatedLyrics.push(lyricsWithTimestamp);
      }
      
      // Update gist with new data
      await updateGist(gists[0].id, updatedLyrics);
    }

    // Update local storage after successful cloud sync
    const stored = JSON.parse(localStorage.getItem('savedLyrics') || '[]');
    const localIndex = stored.findIndex(item => item.title === lyrics.title);
    
    if (localIndex >= 0) {
      stored[localIndex] = lyricsWithTimestamp;
    } else {
      stored.push(lyricsWithTimestamp);
    }
    
    localStorage.setItem('savedLyrics', JSON.stringify(stored));
    return stored;
  } catch (error) {
    console.error('Error syncing lyrics:', error);
    // Fallback to local storage only if cloud sync fails
    const stored = JSON.parse(localStorage.getItem('savedLyrics') || '[]');
    const existingIndex = stored.findIndex(item => item.title === lyrics.title);
    
    if (existingIndex >= 0) {
      stored[existingIndex] = lyricsWithTimestamp;
    } else {
      stored.push(lyricsWithTimestamp);
    }
    
    localStorage.setItem('savedLyrics', JSON.stringify(stored));
    return stored;
  }
};

export const getSavedLyrics = async () => {
  try {
    // Always try to get from GitHub Gists first
    const gists = await listGists();
    if (gists.length > 0) {
      const gistData = await getGist(gists[0].id);
      if (Array.isArray(gistData) && gistData.length > 0) {
        // Update local storage with cloud data
        localStorage.setItem('savedLyrics', JSON.stringify(gistData));
        return gistData;
      }
    }
    
    // If no cloud data, check local storage
    const localData = JSON.parse(localStorage.getItem('savedLyrics') || '[]');
    if (localData.length > 0) {
      // If we have local data but no cloud data, try to sync it to cloud
      await saveLyrics(localData[0]); // This will create a new gist with local data
    }
    return localData;
  } catch (error) {
    console.error('Error getting lyrics from cloud:', error);
    // Fallback to local storage
    return JSON.parse(localStorage.getItem('savedLyrics') || '[]');
  }
};

export const deleteLyrics = async (title) => {
  try {
    // Delete from cloud first
    const gists = await listGists();
    if (gists.length > 0) {
      const gistData = await getGist(gists[0].id);
      const updatedData = gistData.filter(item => item.title !== title);
      await updateGist(gists[0].id, updatedData);
    }

    // Then update local storage
    const stored = JSON.parse(localStorage.getItem('savedLyrics') || '[]');
    const filtered = stored.filter(item => item.title !== title);
    localStorage.setItem('savedLyrics', JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error deleting lyrics:', error);
    // Fallback to local deletion only
    const stored = JSON.parse(localStorage.getItem('savedLyrics') || '[]');
    const filtered = stored.filter(item => item.title !== title);
    localStorage.setItem('savedLyrics', JSON.stringify(filtered));
    return filtered;
  }
};
