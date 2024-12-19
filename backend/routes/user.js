const express = require('express');
const { login, register } = require('../controllers/connectController');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure the correct path and model name

router.post('/login', login);
router.post('/register', register);

module.exports = router;

