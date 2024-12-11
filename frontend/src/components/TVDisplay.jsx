import React, { useEffect, useState } from 'react';
import '../styles/tv.css';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const TVDisplay = () => {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch('http://87.106.130.160/api/columns');
        const data = await response.json();
        setColumns(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des colonnes:', error);
      }
    };

    const interval = setInterval(fetchColumns, 1000); // Rafraîchit toutes les secondes
    fetchColumns();

    return () => {
      clearInterval(interval); // Nettoie l'intervalle lors du démontage
    };
  }, []);

  const deleteCard = async (columnId, cardId) => {
    try {
      await fetch(`http://87.106.130.160/api/cards/${cardId}`, { method: 'DELETE' });

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

  return (
    <div className="tv-display">
      {columns.length > 0 ? (
        columns.map((column) => (
          <div key={column._id} className="column">
            <h2>{column.title}</h2>
            <div className="cards">
              {column.cards.map((card) => (
                <div key={card._id} className="card-container">
                  <button
                    className="delete-button"
                    onClick={() => deleteCard(column._id, card._id)}
                  >
                    &times;
                  </button>
                  <a 
                    href={card.link} 
                    className="card-link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <div className="card">
                      <h4 className="card-title">{card.title}</h4>
                      <p>{card.content}</p>
                      <p className="card-author">Auteur : {card.author || '???'}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
};

export default TVDisplay;