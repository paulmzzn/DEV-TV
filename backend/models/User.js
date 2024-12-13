const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schéma utilisateur
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Ajout d'une méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Ajout d'un hook pour hasher le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);