const Column = require('../models/Column');
const Card = require('../models/Card');

// Créer une nouvelle carte et l'ajouter à la colonne spécifiée

const createCard = async (req, res) => {
    try {
      const { content, columnId } = req.body;
      
      if (!columnId) {
        return res.status(400).json({ error: 'columnId is required' });
      }
  
      // Créer la carte
      const card = new Card({ content, columnId });
  
      // Sauvegarder la carte
      await card.save();
  
      // Ajouter l'ID de la carte à la colonne correspondante
      const column = await Column.findById(columnId);
      if (column) {
        column.cards.push(card._id); // Ajouter l'ID de la carte à la colonne
        await column.save();
      }
  
      res.status(201).json(card);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Error creating card' });
    }
  };

// Mettre à jour une carte existante
const updateCard = async (req, res) => {
    try {
      const { id } = req.params;
      const { columnId } = req.body;
  
      if (!columnId) {
        return res.status(400).json({ error: 'Column ID is required' });
      }
  
      const card = await Card.findById(id);
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }
  
      // Retirer la carte de l'ancienne colonne
      const oldColumn = await Column.findById(card.columnId);
      if (oldColumn) {
        oldColumn.cards = oldColumn.cards.filter((cardId) => cardId.toString() !== id);
        await oldColumn.save();
      }
  
      // Ajouter la carte à la nouvelle colonne
      const newColumn = await Column.findById(columnId);
      if (newColumn) {
        newColumn.cards.push(id);
        await newColumn.save();
      }
  
      // Mettre à jour la colonne de la carte
      card.columnId = columnId;
      await card.save();
  
      res.status(200).json(card);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la carte :', error);
      res.status(500).json({ error: 'Error updating card' });
    }
  };

// Supprimer une carte
const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Trouve la carte et la supprime
    const card = await Card.findByIdAndDelete(id);

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Retirer la carte de la colonne qui la contient
    const column = await Column.findOne({ cards: id });
    if (column) {
      column.cards = column.cards.filter(cardId => cardId.toString() !== id);
      await column.save(); // Sauvegarde la colonne après modification
    }

    res.status(200).json({ message: 'Card deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting card' });
  }
};

module.exports = { createCard, updateCard, deleteCard };