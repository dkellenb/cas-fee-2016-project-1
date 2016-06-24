'use strict';

var notesRepository = require('../services/notesRepository');
var moment = require('momentjs');
var socket = require('../services/socketProvider').get();
var Note = require('../models/note');

/**
 * REST Service get notes.
 *
 * @param req request
 * @param res responses
 */
function publicGetNotes(req, res) {
    notesRepository.all(function (err, notes) {
        if (err) {
            console.log('notesController:publicGetNotes: ' + err);
            res.statusCode = 500;
            return res.send('An internal server error occured. Please contact sys admin or consult the log file');
        }
        res.json(notes);
    });
}

/**
 * REST Service to get a single note.
 *
 * @param req request
 * @param res responses
 */
function publicGetNote(req, res) {
    if (!req.params.id) {
        res.statusCode = 400;
        return res.send('Invalid "id" parameter.');
    }
    notesRepository.get(req.params.id, function (err, note) {
        if (err) {
            console.log('notesController:publicGetNote: ' + err);
            res.statusCode = 500;
            return res.send('An internal server error occured. Please contact sys admin or consult the log file');
        }
        if (note == null) {
            res.statusCode = 404;
            return res.send('Note with id "' + res.params.id + '" not found');
        }
        return res.json(note);
    });
}

function publicCreateModel(req, res) {
    var note = new Note("", "", 3, false, null);
    return res.json(note);
}

/**
 * Creates a new note. Expects nothing.
 *
 * @param req request
 * @param res reponse
 */
function publicCreateNote(req, res) {
    var isFinished = req.body.isFinished === 'true';
    var finishedDate = isFinished ? moment().format('YYYY-MM-DD') : null;
    var note = new Note(req.body.title, req.body.content, req.body.importance, finishedDate, req.body.dueDate);
    notesRepository.add(note, function (err, newNote) {
        if (err) {
            console.log('notesController:publicCreateNote: ' + err);
            res.statusCode = 500;
            return res.send('An internal server error occured. Please contact sys admin or consult the log file');
        }

        // push notification
        if (socket) {
            socket.emit('created', { id: newNote._id });
        }

        // return the new note
        return res.json(newNote);
    });
}

/**
 * Updates a note.
 *
 * @param req request
 * @param res response
 */
function publicUpdateNote(req, res) {
    if (!req.params.id) {
        res.statusCode = 400;
        return res.send('Invalid "id" parameter.');
    }
    notesRepository.get(req.params.id, function (err, persistedNote) {
        if (err) {
            console.log('notesController:publicUpdateNote: ' + err);
            res.statusCode = 500;
            return res.send('An internal server error occured. Please contact sys admin or consult the log file');
        }
        if (persistedNote == null) {
            res.statusCode = 404;
            return res.send('Note with id "' + res.params.id + '" not found');
        }

        // Calculate the finished Date
        var finishedDate;
        var isFinished = req.body.isFinished === 'true';
        if (isFinished && persistedNote.finishedDate == null) {
            finishedDate = moment().format('YYYY-MM-DD');
        } else if (!isFinished && persistedNote.finishedDate != null) {
            finishedDate = null;
        } else {
            finishedDate = persistedNote.finishedDate;
        }

        // Create the updated note
        var updatedNote = new Note(req.body.title, req.body.content, req.body.importance, finishedDate, req.body.dueDate);
        updatedNote._id = persistedNote._id;
        updatedNote.createdDate = persistedNote.createdDate;

        notesRepository.update(updatedNote, function (err, numReplaced) {
            if (err) {
                console.log('notesController:publicUpdateNote: ' + err);
                res.statusCode = 500;
                return res.send('An internal server error occured. Please contact sys admin or consult the log file');
            }

            // push notification
            if (socket) {
                socket.emit('updated', { id: req.params.id });
            }

            // return updated note
            return res.json(updatedNote);
        });
    });
}

/**
 * Delete a note.
 *
 * @param req request
 * @param res response
 */
function publicDeleteNote(req, res) {
    if (!req.params.id) {
        res.statusCode = 400;
        return res.send('Invalid "id" parameter.');
    }
    notesRepository.remove(req.params.id, function (err, numDeleted) {
        if (err) {
            console.log('notesController:publicUpdateNote: ' + err);
            res.statusCode = 500;
            return res.send('An internal server error occured. Please contact sys admin or consult the log file');
        }
        if (numDeleted < 1) {
            res.statusCode = 404;
            return res.send('Note with id "' + res.params.id + '" not found');
        }

        // push notification
        if (socket) {
            socket.emit('deleted', { id: req.params.id });
        }

        return res.send('{ "deleted": "true" }');
    });
}

module.exports = {
    getNotes: publicGetNotes,
    getNote: publicGetNote,
    createNoteModel: publicCreateModel,
    createNote: publicCreateNote,
    updateNote: publicUpdateNote,
    delete: publicDeleteNote
};