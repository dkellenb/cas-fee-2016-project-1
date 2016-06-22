/**
 * Notes repository which is capable of selecting, inserting, updating and deleting notes.
 * @type {{searchNotes, getNote, persistNote, deleteNote}}
 */
(function (namespace) {

    const LOCAL_SORAGE_NOTES_KEY = 'notes';
    const LOCAL_SORAGE_NOTES_SEQUENCE_KEY = 'noteIdSequence';

    /**
     * Gets all persisted notes.
     *
     * @returns {Array} the persisted notes
     */
    var publicSearchNote = function (sortKey, asc, filterKey) {

        var notes = privateLoadNotes();
        var ids = Object.keys(notes);
        console.log(ids);
        var notesArray = ids.map(function (key) {
            return notes[key];
        });

        return sortController.filterAndSortNotes(notesArray, sortKey, asc, filterKey);
    };

    /**
     * Gets a note with the given id.
     *
     * @param id the id of the note
     * @returns {*|{}} null or the object
     */
    var publicGetNote = function (id) {
        var note = privateLoadNotes()[id];
        if (note === undefined) {
            return null;
        }
        return note;
    };

    /**
     * Saves a given note. Updates an existing persisted one.
     *
     * @param note the note to persist
     * @returns the persisted note
     */
    var publicSaveNote = function (note) {
        var id = note.id;
        if (id === null || id === undefined) {
            note.id = privateNextNoteId();
        }
        privatePutNote(note.id, note);
        return note;
    };

    /**
     * Deletes a given note.
     *
     * @param id if the note to be deleted
     * @return {Array} the updated notes
     */
    var publicDeleteNote = function (id) {
        privatePutNote(id, undefined);
    };

    /**
     * loads all persisted notes from localStorage as a map<noteId,Note>.
     * @returns {map<number,{}>} map<noteId,Note>
     */
    var privateLoadNotes = function () {
        var serializedNotes = localStorage.getItem(LOCAL_SORAGE_NOTES_KEY);
        console.log("Load notes: " + serializedNotes);
        return serializedNotes === undefined || serializedNotes === null ? {} : JSON.parse(serializedNotes);
    };

    /**
     * Save all notes.
     *
     * @param notes saves all notes.
     * @returns {map<number,{}>} Map<NoteId,Note> the persisted notes
     */
    var privateSaveNotes = function (notes) {
        var serializedNotes = notes === undefined || notes === null ? "{}" : JSON.stringify(notes);
        localStorage.setItem(LOCAL_SORAGE_NOTES_KEY, serializedNotes);
        return notes;
    };

    /**
     * get Next Id from note sequence in localStorage
     * @returns {number} noteId
     */
    var privateNextNoteId = function () {
        var sequence = localStorage.getItem(LOCAL_SORAGE_NOTES_SEQUENCE_KEY);
        if (sequence == undefined || sequence == null) {
            sequence = 0;
        }
        sequence++;
        localStorage.setItem(LOCAL_SORAGE_NOTES_SEQUENCE_KEY, sequence);

        return sequence;
    };

    /**
     * Put function fuer Notes Map<NoteId,Note>
     * @param key noteId
     * @param value Note
     */
    var privatePutNote = function (key, value) {
        var notes = privateLoadNotes();
        notes[key] = value;
        privateSaveNotes(notes);
    };

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

    namespace.notesRepository = {
        searchNotes: publicSearchNote,
        getNote: publicGetNote,
        saveNote: publicSaveNote,
        deleteNote: publicDeleteNote
    };

})(window.notesnamespace);