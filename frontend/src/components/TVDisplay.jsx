import React, { useEffect, useState } from 'react';
import '../styles/tv.css';  // Ajoute cette ligne pour importer le fichier CSS

const TVDisplay = () => {
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

  return (
    <div className="tv-display">
      {columns.length > 0 ? (
        columns.map((column) => (
          <div key={column.id} className="column">
            <h2>{column.title}</h2>
            <div className="cards">
              {column.cards.map((card) => (
                <div key={card.id} className="card">
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