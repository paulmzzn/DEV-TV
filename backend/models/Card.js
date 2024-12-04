const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  content: { type: String, required: true },
  columnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Column', required: true }, // Assurez-vous que le champ `columnId` est requis
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;