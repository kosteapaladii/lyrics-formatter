import { useState, useEffect } from 'react';
import { listGists, getGist } from '../services/gistService';

const SYNC_INTERVAL = 5000; // Poll every 5 seconds

export const useGistSync = () => {
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLyrics = async () => {
    try {
      const gists = await listGists();
      const lyricsData = await Promise.all(
        gists.map(async (gist) => {
          const content = await getGist(gist.id);
          return { id: gist.id, ...content };
        })
      );
      setLyrics(lyricsData);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLyrics();
    const interval = setInterval(fetchLyrics, SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return { lyrics, loading, error, refreshLyrics: fetchLyrics };
};
