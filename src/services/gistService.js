import axios from 'axios';
import { GITHUB_TOKEN, GIST_FILENAME } from './githubConfig';

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

export const listGists = async () => {
  try {
    const response = await api.get('/gists');
    return response.data.filter(gist => 
      gist.files && gist.files[GIST_FILENAME]
    );
  } catch (error) {
    console.error('Error listing gists:', error);
    throw error;
  }
};

export const createGist = async (content) => {
  try {
    const response = await api.post('/gists', {
      description: 'Cameo Lyrics Sync',
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(content)
        }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating gist:', error);
    throw error;
  }
};

export const getGist = async (gistId) => {
  try {
    const response = await api.get(`/gists/${gistId}`);
    return JSON.parse(response.data.files[GIST_FILENAME].content);
  } catch (error) {
    console.error('Error getting gist:', error);
    throw error;
  }
};

export const updateGist = async (gistId, content) => {
  try {
    await api.patch(`/gists/${gistId}`, {
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(content)
        }
      }
    });
  } catch (error) {
    console.error('Error updating gist:', error);
    throw error;
  }
};

export const deleteGist = async (gistId) => {
  try {
    await api.delete(`/gists/${gistId}`);
    return true;
  } catch (error) {
    console.error('Error deleting gist:', error);
    throw error;
  }
};
