const express = require('express');
const { getColumns, createColumn, deleteColumn } = require('../controllers/columnsController');
const router = express.Router();

router.get('/', getColumns);
router.post('/', createColumn);
router.delete('/:id', deleteColumn);

module.exports = router;