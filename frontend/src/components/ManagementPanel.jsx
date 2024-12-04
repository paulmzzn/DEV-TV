import React, { useEffect, useState } from 'react';
import '../styles/management.css';

const ManagementPanel = () => {
  const [columns, setColumns] = useState([]);
  const [showCardForm, setShowCardForm] = useState(false); // État pour afficher/masquer la popup
  const [currentColumnId, setCurrentColumnId] = useState(null); // Colonne cible pour la nouvelle carte
  const [cardData, setCardData] = useState({ title: '', content: '', link: '' }); // Données du formulaire

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch('http://localhost:3000/columns');
        const data = await response.json();
        setColumns(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des colonnes:', error);
      }
    };
    fetchColumns();
  }, []);

  const addColumn = async () => {
    const title = prompt('Enter column title:');
    if (!title) return;

    const res = await fetch('http://localhost:3000/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, cards: [] }),
    });
    const newColumn = await res.json();
    setColumns([...columns, newColumn]);
  };

  const deleteColumn = async (id) => {
    try {
      await fetch(`http://localhost:3000/columns/${id}`, { method: 'DELETE' });
      setColumns(columns.filter((column) => column._id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la colonne:', error);
    }
  };

  const addCard = async () => {
    if (!cardData.title || !cardData.content) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const newCardData = {
      title: cardData.title,
      content: cardData.content,
      columnId: currentColumnId,
      link: cardData.link,  // Ajouter le lien ici
    };

    try {
      const res = await fetch('http://localhost:3000/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCardData),
      });

      const newCard = await res.json();

      const updatedColumns = columns.map((column) => {
        if (column._id === currentColumnId) {
          return {
            ...column,
            cards: [...column.cards, newCard],
          };
        }
        return column;
      });

      setColumns(updatedColumns);
      setShowCardForm(false);
      setCardData({ title: '', content: '', link: '' }); // Réinitialiser les données
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la carte:', error);
    }
  };

  const deleteCard = async (columnId, cardId) => {
    try {
      await fetch(`http://localhost:3000/cards/${cardId}`, { method: 'DELETE' });

      const updatedColumns = columns.map((column) => {
        if (column._id === columnId) {
          return {
            ...column,
            cards: column.cards.filter((card) => card._id !== cardId),
          };
        }
        return column;
      });

      setColumns(updatedColumns);
    } catch (error) {
      console.error('Erreur lors de la suppression de la carte:', error);
    }
  };

  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDrop = async (e, newColumnId) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');

    const sourceColumn = columns.find((column) =>
      column.cards.some((card) => card._id === cardId)
    );

    if (!sourceColumn) return;

    const cardToMove = sourceColumn.cards.find((card) => card._id === cardId);

    if (!cardToMove) return;

    try {
      await updateCardColumn(cardId, newColumnId);

      const updatedColumns = columns.map((column) => {
        if (column._id === sourceColumn._id) {
          return {
            ...column,
            cards: column.cards.filter((card) => card._id !== cardId),
          };
        }
        if (column._id === newColumnId) {
          return {
            ...column,
            cards: [...column.cards, { ...cardToMove, columnId: newColumnId }],
          };
        }
        return column;
      });

      setColumns(updatedColumns);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la colonne:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const updateCardColumn = async (cardId, newColumnId) => {
    try {
      const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: newColumnId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la carte');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la carte:', error);
      throw error;
    }
  };

  return (
    <div className="management-panel">
      <button onClick={addColumn}>Add Column</button>
      <div className="columns">
        {columns.map((column) => (
          <div
            key={column._id}
            className="column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column._id)}
          >
            <h3>{column.title}</h3>
            <button
              className="btnDeleteColumn"
              onClick={() => deleteColumn(column._id)}
            >
              x
            </button>
            <div className="cards">
              <button
                onClick={() => {
                  setCurrentColumnId(column._id);
                  setShowCardForm(true);
                }}
              >
                Add Card +
              </button>
              {column.cards.map((card) => (
                <div
                  key={card._id}
                  className="card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, card._id)}
                >
                  <h4 className="card-title">{card.title}</h4>
                  <p className="card-content">{card.content}</p>
                  {card.link && (
                    <a href={card.link} target="_blank" rel="noopener noreferrer">
                      {card.link}
                    </a>
                  )}
                  <button
                    className="btndeletecard"
                    onClick={() => deleteCard(column._id, card._id)}
                  >
                    Delete Card
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showCardForm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Nouvelle Carte</h3>
            <label>
              Titre :
              <input
                type="text"
                value={cardData.title}
                onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
              />
            </label>
            <label>
              Contenu :
              <textarea
                value={cardData.content}
                onChange={(e) => setCardData({ ...cardData, content: e.target.value })}
              />
            </label>
            <label>
              Lien :
              <input
                type="url"
                value={cardData.link || ''}
                onChange={(e) => setCardData({ ...cardData, link: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button className="btncancel" onClick={() => setShowCardForm(false)}>Annuler</button>
              <button onClick={addCard}>Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementPanel;