'use strict';

var express = require('express');
var router = express.Router();
var notesController = require('../controllers/notesController.js');

// Get all notes
router.get('/', notesController.getNotes);
router.post('/', notesController.createNote);
router.get('/:id/', notesController.getNote);
router.put('/:id/', notesController.updateNote);
router.delete("/:id/", notesController.delete);

module.exports = router;