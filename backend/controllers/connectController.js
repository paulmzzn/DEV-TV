const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('../models/db');

dotenv.config();

const login = async (req, res) => {
  const { username, password } = req.body;

  // Vérifie les identifiants
  const user = await User.findOne ({ username });
    if (!user) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Crée un JWT
    res.json({ token });
}

const register = async (req, res) => {
  const { username, password } = req.body;

  // Vérifie les identifiants
  const user = await User.findOne ({ username });
    if (user) {
        return res.status(401).json({ message: 'Utilisateur déjà existant' });
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.json({ message: 'Utilisateur créé' });
}

module.exports = { login, register };