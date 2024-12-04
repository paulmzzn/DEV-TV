import React, { useEffect, useState } from 'react';
import '../styles/management.css';

const ManagementPanel = () => {
  const [columns, setColumns] = useState([]);

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

  const updateCardColumn = async (cardId, newColumnId) => {
    try {
      const res = await fetch(`http://localhost:3000/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: newColumnId }),
      });
  
      if (!res.ok) {
        const errorDetails = await res.json();
        console.error('Erreur lors de la mise à jour :', errorDetails);
        throw new Error('Failed to update card column');
      }
  
      console.log(`Carte ${cardId} mise à jour vers la colonne ${newColumnId}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la colonne de la carte :', error);
    }
  };

  const addColumn = async () => {
    const title = prompt('Enter column title:');
    const res = await fetch('http://localhost:3000/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, cards: [] }),
    });
    const newColumn = await res.json();
    setColumns([...columns, newColumn]);
  };

  const deleteColumn = async (id) => {
    await fetch(`http://localhost:3000/columns/${id}`, { method: 'DELETE' });
    setColumns(columns.filter((column) => column._id !== id));
  };

  const addCard = async (columnId) => {
    const content = prompt('Enter card content:');
    if (!content) return;  // Si aucun contenu n'est saisi, ne pas continuer

    const newCardData = {
      content,
      columnId
    };

    try {
      const res = await fetch('http://localhost:3000/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCardData),
      });

      const newCard = await res.json();

      const updatedColumns = columns.map((column) => {
        if (column._id === columnId) {
          return { 
            ...column, 
            cards: [...column.cards, newCard] 
          };
        }
        return column;
      });

      setColumns(updatedColumns);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la carte:', error);
    }
  };

  const deleteCard = async (columnId, cardId) => {
    try {
      await fetch(`http://localhost:3000/cards/${cardId}`, {
        method: 'DELETE',
      });

      const updatedColumns = columns.map((column) => {
        if (column._id === columnId) {
          return { 
            ...column, 
            cards: column.cards.filter((card) => card._id !== cardId) 
          };
        }
        return column;
      });

      setColumns(updatedColumns); // Mise à jour de l'état des colonnes après suppression
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
  
    // Trouver la carte et la colonne d'origine
    const sourceColumn = columns.find((column) =>
      column.cards.some((card) => card._id === cardId)
    );
  
    if (!sourceColumn) return; // Si la colonne source n'est pas trouvée, arrêter
  
    // Trouver la carte
    const cardToMove = sourceColumn.cards.find((card) => card._id === cardId);
  
    if (!cardToMove) return; // Si la carte n'est pas trouvée, arrêter
  
    // Mettre à jour la colonne dans la base de données
    try {
      await updateCardColumn(cardId, newColumnId);
  
      // Mettre à jour l'état local
      const updatedColumns = columns.map((column) => {
        if (column._id === sourceColumn._id) {
          // Retirer la carte de l'ancienne colonne
          return {
            ...column,
            cards: column.cards.filter((card) => card._id !== cardId),
          };
        }
        if (column._id === newColumnId) {
          // Ajouter la carte à la nouvelle colonne
          return {
            ...column,
            cards: [...column.cards, { ...cardToMove, columnId: newColumnId }],
          };
        }
        return column; // Ne pas modifier les autres colonnes
      });
  
      setColumns(updatedColumns);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la colonne :", error);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault(); // Permet de déposer l'élément
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
            onDrop={(e) => handleDrop(e, column._id)} // Dépose dans une colonne
          >
            <h3>{column.title}</h3>
            <button
              className="btnDeleteColumn"
              onClick={() => deleteColumn(column._id)}
            >
              x
            </button>
            <div className="cards">
              <button onClick={() => addCard(column._id)}>Add Card +</button>
              {column.cards.map((card) => (
                <div
                  key={card._id}
                  className="card"
                  draggable // Rendre la carte déplaçable
                  onDragStart={(e) => handleDragStart(e, card._id)} // Début du drag
                >
                  {card.content}
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
    </div>
  );
};

export default ManagementPanel;