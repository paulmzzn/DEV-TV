const Column = require('../models/Column');

const getColumns = async (req, res) => {
  try {
    // Récupérer toutes les colonnes avec les cartes associées
    const columns = await Column.find().populate('cards'); // Peupler le champ 'cards'
    res.status(200).json(columns);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des colonnes' });
  }
};

const createColumn = async (req, res) => {
  try {
    const column = new Column(req.body);
    await column.save();
    res.status(201).json(column);
  } catch (error) {
    res.status(400).json({ error: 'Error creating column' });
  }
};

const deleteColumn = async (req, res) => {
  try {
    const { id } = req.params;
    await Column.findByIdAndDelete(id);
    res.status(200).json({ message: 'Column deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting column' });
  }
};

module.exports = { getColumns, createColumn, deleteColumn };