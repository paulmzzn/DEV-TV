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
      const { id } = req.params; // Récupération de l'ID de la carte à mettre à jour
      const { columnId, ...updateData } = req.body; // Extraction de l'ID de colonne et des autres données de la requête
  
      console.log(`Requête reçue pour mettre à jour la carte ${id}`);
      console.log('Nouvelle colonne ID:', columnId);
      console.log('Données supplémentaires:', updateData);
  
      if (!columnId) {
        console.error('columnId manquant dans la requête');
        return res.status(400).json({ error: 'Column ID is required' });
      }
  
      // Mise à jour de la carte dans la base de données
      const updatedCard = await Card.findByIdAndUpdate(
        id,
        { columnId, ...updateData }, // Mise à jour de la colonne et d'autres champs éventuels
        { new: true } // Retourner le document mis à jour
      );
  
      console.log('Carte après mise à jour:', updatedCard);
  
      if (!updatedCard) {
        console.error('Carte non trouvée pour mise à jour');
        return res.status(404).json({ error: 'Card not found' });
      }
  
      // Vérification et retour de la réponse
      console.log(`Carte mise à jour avec succès. Nouvelle colonne : ${updatedCard.columnId}`);
      res.status(200).json({
        message: 'Card updated successfully',
        card: updatedCard,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la carte:', error);
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