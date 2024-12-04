const API_BASE_URL = 'http://localhost:3000'; // Remplace par l'URL de ton backend

export const getColumns = async () => {
  const response = await fetch(`${API_BASE_URL}/columns`);
  if (!response.ok) throw new Error('Failed to fetch columns');
  return response.json();
};

export const createCard = async (columnId, content) => {
  const response = await fetch(`${API_BASE_URL}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ columnId, content }),
  });
  if (!response.ok) throw new Error('Failed to create card');
  return response.json();
};

export const updateCard = async (cardId, newContent) => {
  const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: newContent }),
  });
  if (!response.ok) throw new Error('Failed to update card');
  return response.json();
};

export const deleteCard = async (cardId) => {
  const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete card');
  return response.json();
};