// ...existing code...

export const deleteGist = async (gistId) => {
  try {
    await api.delete(`/gists/${gistId}`);
    return true;
  } catch (error) {
    console.error('Error deleting gist:', error);
    throw error;
  }
};
