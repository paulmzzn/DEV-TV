const express = require('express');
const { createCard, updateCardid, deleteCard, updateCard } = require('../controllers/cardsController');
const router = express.Router();

router.post('/', (req, res) => {
  createCard(req, res);
  console.log('POST / - Response:', res.statusCode, res.statusMessage);
  console.log('POST / - Request Body:', req.body);
  console.log('POST / - Headers:', req.headers);
  res.on('finish', () => {
    console.log('POST / - Response Body:', res.body);
  });
});

router.delete('/:id', (req, res) => {
  deleteCard(req, res);
  console.log('DELETE /:id - Response:', res.statusCode, res.statusMessage);
  console.log('DELETE /:id - Request Params:', req.params);
  console.log('DELETE /:id - Headers:', req.headers);
  res.on('finish', () => {
    console.log('DELETE /:id - Response Body:', res.body);
  });
});

router.patch('/:id', (req, res) => {
  updateCardid(req, res);
  console.log('PATCH /:id - Response:', res.statusCode, res.statusMessage);
  console.log('PATCH /:id - Request Params:', req.params);
  console.log('PATCH /:id - Request Body:', req.body);
  console.log('PATCH /:id - Headers:', req.headers);
  res.on('finish', () => {
    console.log('PATCH /:id - Response Body:', res.body);
  });
});

router.put('/:id', (req, res) => {
  updateCard(req, res);
  console.log('PUT /:id - Response:', res.statusCode, res.statusMessage);
  console.log('PUT /:id - Request Params:', req.params);
  console.log('PUT /:id - Request Body:', req.body);
  console.log('PUT /:id - Headers:', req.headers);
  res.on('finish', () => {
    console.log('PUT /:id - Response Body:', res.body);
  });
});

module.exports = router;