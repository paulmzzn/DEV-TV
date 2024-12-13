const Column = require('../models/Column');
const Card = require('../models/Card');

// Créer une nouvelle carte et l'ajouter à la colonne spécifiée
const createCard = async (req, res) => {
  try {
    const { title, content, columnId, link, author, status, societe, assigne, priority } = req.body;

    if (!title || !columnId) {
      return res.status(400).json({ error: 'title and columnId are required' });
    }

    // Créer la carte
    const card = new Card({ title, content, columnId, link, author, status, societe, assigne, priority });
    await card.save();

    // Ajouter l'ID de la carte à la colonne correspondante
    const column = await Column.findById(columnId);
    if (column) {
      column.cards.push(card._id);
      await column.save();
    }

    res.status(201).json(card);
    console.log('Card created:', card);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(400).json({ error: 'Error creating card' });
  }
};

// Mettre à jour une carte existante
const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, title, link, columnId, author, status, societe, assigne, priority } = req.body;

    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (content !== undefined) card.content = content;
    if (title !== undefined) card.title = title;
    if (link !== undefined) card.link = link;
    if (columnId !== undefined) card.columnId = columnId;
    if (author !== undefined) card.author = author;
    if (status !== undefined) card.status = status;
    if (societe !== undefined) card.societe = societe;
    if (assigne !== undefined) card.assigne = assigne;
    if (priority !== undefined) card.priority = priority;


    await card.save();

    res.status(200).json(card);
    console.log('Card updated:', card);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Error updating card' });
  }
};

// Mettre à jour l'ID de la colonne d'une carte
const updateCardid = async (req, res) => {
  try {
    const { id } = req.params;
    const { columnId } = req.body;

    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Retirer la carte de l'ancienne colonne
    const oldColumn = await Column.findById(card.columnId);
    if (oldColumn) {
      oldColumn.cards = oldColumn.cards.filter(cardId => cardId.toString() !== id);
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
    console.log('Card column updated:', card);
  } catch (error) {
    console.error('Error updating card column:', error);
    res.status(500).json({ error: 'Error updating card column' });
  }
};

// Supprimer une carte
const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findByIdAndDelete(id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const column = await Column.findOne({ cards: id });
    if (column) {
      column.cards = column.cards.filter(cardId => cardId.toString() !== id);
      await column.save();
    }

    res.status(200).json({ message: 'Card deleted' });
    console.log('Card deleted:', card);
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Error deleting card' });
  }
};

module.exports = { createCard, updateCardid, deleteCard, updateCard };