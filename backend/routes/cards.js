const express = require('express');
const { createCard, updateCard, deleteCard, } = require('../controllers/cardsController');
const router = express.Router();


router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);
router.patch('/:id', updateCard);
module.exports = router;