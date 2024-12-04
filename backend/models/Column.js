const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
});

module.exports = mongoose.model('Column', columnSchema);