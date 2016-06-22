'use strict';

var Datastore = require('nedb');
var db = new Datastore({
    filename: './data/notes.db',
    autoload: true
});

/**
 * Returns all existing notes.
 *
 * @param callback callback being executed
 */
function publicFindAll(callback) {
    db.find({}, function (err, notes) {
        if (callback) {
            callback(err, notes);
        }
    });
}

/**
 * Returns all matching notes for the given filter criteria.
 *
 * @param filter the filter criteria
 * @param callback callback being executed
 * @return an array
 */
function publicFindFiltered(filter, callback) {
    db.find(filter, function (err, notes) {
        if (callback) {
            callback(err, notes);
        }
    });
}

/**
 * Returns the note with the given id.
 *
 * @param id id of the entry to be retrieved
 * @param callback callback being executed
 * @return null if no elements found
 */
function publicGet(id, callback) {
    db.findOne({_id: id}, function (err, note) {
        if (callback) {
            callback(err, note);
        }
    });
}

/**
 * Adds the given note.
 *
 * @param note the note to be persisted
 * @param callback callback being executed
 */
function publicAdd(note, callback) {
    db.insert(note, function (err, newNote) {
        if (callback) {
            callback(err, newNote);
        }
    });
}

/**
 * Updates the given note.
 *
 * @param note the note to be updated
 * @param callback callback being executed
 */
function publicUpdate(note, callback) {
    db.update({ _id: note._id }, note, {}, function (err, numReplaced) {
        if (callback) {
            callback(err, numReplaced);
        }
    });
}

/**
 * Removes the note with the given id.
 *
 * @param id id of the note to be deleted
 * @param callback the callback being executed
 */
function publicRemove(id, callback) {
    db.remove({_id: id}, {}, function (err, numRemoved) {
        callback(err, numRemoved);
    });
}

module.exports = {
    all: publicFindAll,
    filtered: publicFindFiltered,
    get: publicGet,
    add: publicAdd,
    update: publicUpdate,
    remove: publicRemove
};
