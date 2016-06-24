'use strict';

var express = require('express');
var router = express.Router();
var notesController = require('../controllers/notesController');

router.get('/', notesController.getNotes);
router.post('/', notesController.createNote);
router.get('/model/', notesController.createNoteModel);
router.get('/:id/', notesController.getNote);
router.put('/:id/', notesController.updateNote);
router.delete("/:id/", notesController.delete);

module.exports = router;