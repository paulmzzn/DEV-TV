const express = require('express');
const { createCard, updateCardid, deleteCard,updateCard } = require('../controllers/cardsController');
const router = express.Router();


router.post('/', createCard);
router.delete('/:id', deleteCard);
router.patch('/:id', updateCardid);
router.put('/:id', updateCard);
module.exports = router;