'use strict';

/**
 * Notes controller implements REST methods for all operations behind '/notes/' path. Supporting:
 * - get all notes
 * - get single note
 * - get note model
 * - create new note
 * - update note
 * - delete note
 */

// Dependencies
var notesRepository = require('../services/notesRepository');
var moment = require('moment');
var socket = require('../services/socketProvider');
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
        notes.forEach(function (note) {
            privateEnhanceNoteObject(note);
        });
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
        return res.json(privateEnhanceNoteObject(note));
    });
}

function publicCreateModel(req, res) {
    var note = new Note("", "", 3, false, null);
    return res.json(privateEnhanceNoteObject(note));
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
        if (socket.isReady()) {
            socket.emitMessage('created', newNote._id, req.get('X-Note-Socket-ID'));
        }

        // return the new note
        return res.json(privateEnhanceNoteObject(newNote));
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
            if (socket.isReady()) {
                socket.emitMessage('updated', req.params.id, req.get('X-Note-Socket-ID'));
            }

            // return updated note
            return res.json(privateEnhanceNoteObject(updatedNote));
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
        if (socket.isReady()) {
            socket.emitMessage('deleted', req.params.id, req.get('X-Note-Socket-ID'));
        }

        return res.send('{ "deleted": "true" }');
    });
}

/**
 * Function for get the value types back to date and number.
 * @param note
 * @returns with type enhanced Note
 */
function privateEnhanceNoteObject(note) {
    //note.dueDate = privateParseDateString(note.dueDate);
    //note.createdDate = privateParseDateString(note.createdDate);
    //note.finishedDate = privateParseDateString(note.finishedDate);
    return note;
}

function privateParseDateString(dateString) {
    if (dateString !== undefined && dateString !== null && dateString) {
        return new Date(dateString.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    }
    return null;
}

module.exports = {
    getNotes: publicGetNotes,
    getNote: publicGetNote,
    createNoteModel: publicCreateModel,
    createNote: publicCreateNote,
    updateNote: publicUpdateNote,
    delete: publicDeleteNote
};