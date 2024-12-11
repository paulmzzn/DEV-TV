import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { useEffect, useState } from 'react';
import '../styles/management.css';
import '../styles/tv.css';

const ManagementPanel = () => {
  const [columns, setColumns] = useState([]);
  const [showCardForm, setShowCardForm] = useState(false); // État pour afficher/masquer la popup
  const [currentColumnId, setCurrentColumnId] = useState(null); // Colonne cible pour la nouvelle carte
  const [cardData, setCardData] = useState({ title: '', content: '', link: '', author: '', status: '' });
  const [showEditCardForm, setShowEditCardForm] = useState(false); // État pour afficher/masquer le formulaire d'édition
  const [editCardData, setEditCardData] = useState({ title: '', content: '', link: '', author: '', cardId: '', status: '' });

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/columns');
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

    const res = await fetch('http://localhost:3000/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, cards: [] }),
    });
    const newColumn = await res.json();
    setColumns([...columns, newColumn]);
  };

  const deleteColumn = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/columns/${id}`, { method: 'DELETE' });
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
      author: cardData.author,
    };

    try {
      const res = await fetch('http://localhost:3000/api/cards', {
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
      await fetch(`http://localhost:3000/api/cards/${cardId}`, { method: 'DELETE' });

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
    
    console.log("Card ID dropped: ", cardId);
    console.log("Target column ID: ", newColumnId);

    const sourceColumn = columns.find((column) =>
        column.cards.some((card) => card._id === cardId)
    );

    if (!sourceColumn) {
        console.log("Source column not found");
        return;
    }

    console.log("Source column found: ", sourceColumn);

    const cardToMove = sourceColumn.cards.find((card) => card._id === cardId);

    if (!cardToMove) {
        console.log("Card to move not found in the source column");
        return;
    }

    console.log("Card to move: ", cardToMove);

    if (sourceColumn._id === newColumnId) {
        console.log("Card dropped in the same column, no update needed.");
        return;
    }

    try {
        // Mise à jour de la carte avec le nouveau columnId
        console.log("Updating card column...");
        await updateCardColumn(cardId, newColumnId, cardToMove);

        // Mettre à jour les colonnes dans le state local
        console.log("Updating columns in the local state...");
        const updatedColumns = columns.map((column) => {
            if (column._id === sourceColumn._id) {
                console.log("Removing card from source column: ", sourceColumn._id);
                return {
                    ...column,
                    cards: column.cards.filter((card) => card._id !== cardId), // Retirer la carte de la colonne source
                };
            }
            if (column._id === newColumnId) {
                console.log("Adding card to new column: ", newColumnId);
                return {
                    ...column,
                    cards: [...column.cards, { ...cardToMove, columnId: newColumnId }], // Ajouter la carte à la nouvelle colonne
                };
            }
            return column;
        });

        console.log("Updated columns: ", updatedColumns);
        setColumns(updatedColumns); // Mettre à jour l'état local
    } catch (error) {
        console.error('Erreur lors du déplacement de la carte:', error);
    }
};

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const updateCardColumn = async (cardId, newColumnId, cardToMove) => {
    console.log(`Sending update request for card ID: ${cardId} to column ID: ${newColumnId}`);
  
    try {
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cardToMove.title,
          content: cardToMove.content,
          link: cardToMove.link,
          columnId: newColumnId, // Mise à jour du columnId
        }),
      });
  
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la carte');
      }
  
      console.log("Card successfully updated in the database");
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la carte:', error);
      throw error;
    }
  };
  
  const openEditCardForm = (card) => {
    setEditCardData({ ...card, cardId: card._id });
    setShowEditCardForm(true);
  };

  const updateCard = async () => {
    if (!editCardData.title || !editCardData.content || !editCardData.columnId) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
  
    console.log('Données de la carte à mettre à jour:', editCardData); // Log des données envoyées
  
    try {
      const res = await fetch(`http://localhost:3000/api/cards/${editCardData.cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editCardData.title,
          content: editCardData.content,
          link: editCardData.link,
          columnId: editCardData.columnId, // Ajout du columnId
          author: editCardData.author,
          status: editCardData.status, // Assurez-vous que status est inclus
        }),
      });
  
      console.log('Réponse de la requête PUT:', res); // Log de la réponse du serveur
  
      if (!res.ok) {
        const errorData = await res.json(); // Capture les erreurs envoyées par le serveur
        console.error('Erreur dans la réponse du serveur:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la carte');
      }
  
      const updatedCard = await res.json();
      console.log('Carte mise à jour:', updatedCard); // Log de la carte mise à jour
  
      const updatedColumns = columns.map((column) => {
        if (column.cards.some((card) => card._id === editCardData.cardId)) {
          return {
            ...column,
            cards: column.cards.map((card) =>
              card._id === editCardData.cardId ? updatedCard : card
            ),
          };
        }
        return column;
      });
  
      setColumns(updatedColumns);
      setShowEditCardForm(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la carte:', error);
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
                <div className="card-footer">
                  <p className={`card-status ${card.status === 'Disponible' ? 'available' : 'unavailable'}`}>
                    <b>{card.status || '???'}</b>
                  </p>
                  <p className="card-author">Auteur : {card.author || '???'}</p>
                </div>
                  <div className="card-buttons">
                    <button className="btnupdatecard" onClick={() => openEditCardForm(card)}>
                        Update Card
                    </button>
                    <button className="btndeletecard" onClick={() => deleteCard(column._id, card._id)}>
                        Delete Card
                    </button>
                    
                  </div>
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
            <label>
                Auteur :
                <input type="text" value={cardData.author} onChange={(e) => setCardData({ ...cardData, author: e.target.value })}/>
            </label>
            <div className="form-actions">
              <button className="btncancel" onClick={() => setShowCardForm(false)}>Annuler</button>
              <button onClick={addCard}>Ajouter</button>
            </div>
          </div>
        </div>
      )}
      {showEditCardForm && (
  <div className="popup-overlay">
    <div className="popup-content">
      <h3>Modifier la Carte</h3>
      <label>
        Titre :
        <input
          type="text"
          value={editCardData.title}
          onChange={(e) => setEditCardData({ ...editCardData, title: e.target.value })}
        />
      </label>
      <label>
        Contenu :
        <textarea
          value={editCardData.content}
          onChange={(e) => setEditCardData({ ...editCardData, content: e.target.value })}
        />
      </label>
      <label>
        Lien :
        <input
          type="url"
          value={editCardData.link || ''}
          onChange={(e) => setEditCardData({ ...editCardData, link: e.target.value })}
        />
      </label>
      <label>
        Auteur :
        <input
          type="text"
          value={editCardData.author}
          onChange={(e) => setEditCardData({ ...editCardData, author: e.target.value })}
        />
      </label>
      <label>
        Statut :
        <input
          type="text"
          value={editCardData.status}
          onChange={(e) => setEditCardData({ ...editCardData, status: e.target.value })}
        />
      </label>
      <div className="form-actions">
        <button className="btncancel" onClick={() => setShowEditCardForm(false)}>Annuler</button>
        <button onClick={updateCard}>Mettre à Jour</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ManagementPanel;