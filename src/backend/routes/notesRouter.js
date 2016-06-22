'use strict';

module.exports = function (io) {
    var express = require('express');
    var router = express.Router();
    var notesController = require('../controllers/notesController.js')(io);

    router.get('/', notesController.getNotes);
    router.post('/', notesController.createNote);
    router.get('/:id/', notesController.getNote);
    router.put('/:id/', notesController.updateNote);
    router.delete("/:id/", notesController.delete);

    return router;
};