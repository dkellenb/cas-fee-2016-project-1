/**
 * Notes repository which is capable of selecting, inserting, updating and deleting notes.
 * @type {{searchNotes, getNote, persistNote, deleteNote}}
 */
(function (namespace) {

    /**
     * Controller for sorting the Lists
     */
    var sortController = function () {
        var sortFunktions = {
            finished: function (direction) {
                return function (noteA, noteB) {
                    if (noteA.due == noteB.due) {
                        return 0;
                    }
                    return (direction && noteA.due < noteB.due) ? -1 : 1;
                }
            },
            created: function (direction) {
                return function (noteA, noteB) {
                    if (noteA.createDate == noteB.createDate) {
                        return 0;
                    }
                    return (direction && noteA.due < noteB.due) ? -1 : 1;
                }
            },
            importance: function (direction) {
                return function (noteA, noteB) {
                    if (noteA.due == noteB.due) {
                        return 0;
                    }
                    return (direction && noteA.due < noteB.due) ? -1 : 1;
                }
            }
        };

        var filterFunktions = {
            finished: function (note) {
                return !note.finished;
            }
        };


        var publicFilterAndSortNotes = function (notesArray, sortKey, asc, filterKey) {
            console.log('SortFunction was called with -> sortKey: ' + sortKey + ' arc: ' + asc + ' filterKey: ' + filterKey);
            if (filterKey !== null && filterKey !== undefined) {
                notesArray = notesArray.filter(filterFunktions[filterKey]);
            }

            if (sortKey !== null && sortKey !== undefined) {
                notesArray = notesArray.sort(sortFunktions[sortKey](asc));
            }
            return notesArray;
        };

        return {
            filterAndSortNotes: publicFilterAndSortNotes
        };
    }();

    /**
     * Loads all notes.
     * @param callback after all notes have been loaded.
     */
    var privateLoadNotes = function (callback) {
        $.ajax({
            dataType: 'json',
            method: 'GET',
            url: '/rest/notes/'
        }).done(function(notes) {
            if (notes) {
                notes.forEach(function (note) {
                    note.id = note._id;
                })
            }
            callback(undefined, notes);
        }).fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log('Load notes failed: ' + err );
            callback(err);
        });
    };

    /**
     * Gets all persisted notes.
     *
     * @returns {Array} the persisted notes
     */
    var publicGetNotes = function (callback) {
        // TODO pass sort configuration and filter configuration
        privateLoadNotes(function (err, notes) {
            if (err) {
                callback(err);
            } else {
                //var sortedNotes = sortController.filterAndSortNotes(notes, sortKey, asc, filterKey);
                callback(err, notes);
            }
        });
    };

    /**
     * Gets a note with the given id.
     *
     * @param id the id of the note
     * @param callback success callback
     */
    var publicGetNote = function (id, callback) {
        $.ajax({
            dataType: 'json',
            method: 'GET',
            url: '/rest/notes/' + id + '/'
        }).done(function(note) {
            note.id = note._id;
            callback(undefined, note);
        }).fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log('Load note for id "' + id + '" failed: ' + err );
            callback(err);
        });
    };

    /**
     * Saves a given note. Updates an existing persisted one.
     *
     * @param note the note to persist
     * @param callback success callback
     */
    var publicSaveNote = function (note, callback) {
        $.ajax({
            dataType: 'json',
            method: 'PUT',
            url: '/rest/notes/' + note.id + '/',
            data: note
        }).done(function(note) {
            callback(undefined, note);
        }).fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log('Save note for id "' + id + '" failed: ' + err );
            callback(err);
        });
    };

    /**
     * Deletes a given note.
     *
     * @param id if the note to be deleted
     * @param callback the callback executed after delete
     */
    var publicDeleteNote = function (id, callback) {
        $.ajax({
            dataType: 'json',
            method: 'DELETE',
            url: '/rest/notes/' + id + '/'
        }).done(function(note) {
            callback(undefined, note);
        }).fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log('Save note for id "' + id + '" failed: ' + err );
            callback(err);
        });
    };

    /**
     * Creates a note.
     * @param callback after note has been created
     */
    var publicCreateNote = function(callback) {
        $.ajax({
            dataType: 'json',
            method: 'POST',
            url: '/rest/notes/'
        }).done(function(note) {
            note.id = note._id;
            callback(undefined, note);
        }).fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log('Load notes failed: ' + err );
            callback(err);
        });
    };

    /**
     * Gets a note model.
     *
     * @param callback success callback
     */
    var publicGetNoteModel = function (callback) {
        $.ajax({
            dataType: 'json',
            method: 'GET',
            url: '/rest/notes/model/'
        }).done(function(note) {
            note.id = note._id;
            callback(undefined, note);
        }).fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log('Load note for id "' + id + '" failed: ' + err );
            callback(err);
        });
    };

    namespace.notesRepository = {
        getNotes: publicGetNotes,
        getNote: publicGetNote,
        saveNote: publicSaveNote,
        deleteNote: publicDeleteNote,
        createNote: publicCreateNote,
        getNoteModel: publicGetNoteModel
    };

})(window.notesnamespace);