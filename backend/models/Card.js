const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  title: { type: String },
  content: { type: String},
  columnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Column'},
  link: { type: String, required: false },  // Ajoutez un champ link
  author : { type: String, required: false }, // Ajoutez un champ author
  status : { type: String, required: false, default: 'À faire' }, // Ajoutez un champ statut
  societe : { type: String, required: false, default: 'François'}, // Ajoutez un champ societe
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;