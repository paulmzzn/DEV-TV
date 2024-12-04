import React, { useState } from 'react';
import Card from './Card';
import './column.css';

const Column = ({ column, onAddCard, onEditCard, onDeleteCard }) => {
  const [newCardContent, setNewCardContent] = useState('');

  const handleAddCard = () => {
    if (newCardContent.trim()) {
      onAddCard(column._id, newCardContent);
      setNewCardContent('');
    }
  };

  return (
    <div className="column">
      <h3>{column.title}</h3>
      <div className="cards">
        {column.cards.map((card) => (
          <Card
            key={card._id}
            card={card}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
          />
        ))}
      </div>
      <div className="add-card">
        <input
          type="text"
          placeholder="Add new card"
          value={newCardContent}
          onChange={(e) => setNewCardContent(e.target.value)}
        />
        <button onClick={handleAddCard}>Add</button>
      </div>
    </div>
  );
};

export default Column;