import React, { useEffect, useState } from 'react';
import '../styles/tv.css';

const TVDisplay = () => {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    // Fonction pour récupérer les colonnes depuis le serveur
    const fetchColumns = async () => {
      try {
        const response = await fetch('https://dev-tv.onrender.com/columns');
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
                <a 
                  key={card._id} 
                  href={card.link} 
                  className="card-link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <div className="card">
                    <h4 className="card-title">{card.title}</h4>
                    <p>{card.content}</p>
                  </div>
                </a>
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