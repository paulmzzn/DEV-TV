const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  title: { type: String },
  content: { type: String, required: true },
  columnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Column', required: true },
  link: { type: String, required: false },  // Ajoutez un champ link
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;