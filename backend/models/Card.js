const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  title: { type: String },
  content: { type: String},
  columnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Column'},
  link: { type: String, required: false },  // Ajoutez un champ link
  author : { type: String, required: false }, // Ajoutez un champ author
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;