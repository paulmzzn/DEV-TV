import React from 'react';
import './card.css';

const Card = ({ card, onEdit, onDelete }) => {
  return (
    <div className="card">
      <p>{card.content}</p>
      <div className="card-actions">
        <button onClick={() => onEdit(card)}>Edit</button>
        <button onClick={() => onDelete(card._id)}>Delete</button>
      </div>
    </div>
  );
};

export default Card;