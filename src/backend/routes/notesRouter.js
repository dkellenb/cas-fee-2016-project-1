'use strict';

var express = require('express');
var router = express.Router();
var notesController = require('../notesController.js');

// Get all notes
router.get('/notes', notesController.getNotes);
router.post('/notes', notesController.createNote);
router.get('/notes/:id', notesController.getNote);
router.put('/notes/:id', notesController.updateNote);
router.delete('/notes/:id', notesController.delete);

module.exports = router;