const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  title: { type: String },
  content: { type: String },
  columnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Column' },
  link: { type: String, required: false },
  author: { type: String, required: false },
  status: { type: String, required: false, default: 'À faire' },
  assigne: { type: String, required: false, default: 'Personne' },
  societe: { type: String, required: false, default: 'François' },
  priority: { type: String, required: false, default: 'Très faible priorité' },
  archived: { type: Boolean, default: false },
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;