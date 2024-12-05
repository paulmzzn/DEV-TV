import React, { useEffect, useState } from 'react';
import '../styles/tv.css';

const TVDisplay = () => {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    // Fonction pour récupérer les colonnes depuis le serveur
    const fetchColumns = async () => {
      try {
        const response = await fetch('http://localhost:3000/columns');
        const data = await response.json();
        setColumns(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des colonnes:', error);
      }
    };

    // Initialiser la récupération des données au montage du composant
    fetchColumns();

    // Rafraîchir les données toutes les 10 secondes
    const interval = setInterval(fetchColumns, 1000); // Intervalle de 10 secondes

    // Nettoyage de l'intervalle lors du démontage du composant
    return () => {
      clearInterval(interval);
    };
  }, []); // L'effet s'exécute uniquement lors du montage du composant

  return (
    <div className="tv-display">
      {columns.length > 0 ? (
        columns.map((column) => (
          <div key={column._id} className="column">
            <h2>{column.title}</h2>
            <div className="cards">
              {column.cards.map((card) => (
                <div key={card._id} className="card">
                  <h4 className="card-title">{card.title}</h4>
                  <p>{card.content}</p>
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