'use strict';

/**
 * Handlebars configuration and extensions.
 */
(function (Handlebars) {
    var DateFormats = {
        short: 'DD.MM.YYYY',
        long: 'dddd DD.MM.YYYY HH:mm',
        input: 'YYYY-MM-DD'
    };

    Handlebars.registerHelper("formatDate", function (datetime, format) {
        if (moment) {
            // can use other formats like 'lll' too
            format = DateFormats[format] || format;
            return moment(datetime).format(format);
        }
        else {
            return datetime;
        }
    });

    // replace \r\n with <br> tag. (bypass default escaping by manually do the escaping)
    Handlebars.registerHelper('lineBreakReplacer', function (content) {
        var escapedContent = Handlebars.Utils.escapeExpression(content);
        var lineBreakPattern = /\r\n?|\n/g;
        return new Handlebars.SafeString(escapedContent.replace(lineBreakPattern, '<br>'));
    });

    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });

    Handlebars.getTemplate = function (name) {
        if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
            $.ajax({
                url: 'hbs/' + name + '.hbs',
                success: function (data) {
                    if (Handlebars.templates === undefined) {
                        Handlebars.templates = {};
                    }
                    Handlebars.templates[name] = Handlebars.compile(data);
                },
                async: false
            });
        }
        return Handlebars.templates[name];
    };

})(Handlebars);

/**
 * JQuery extension.
 */
(function ($) {
    $.urlParam = function (name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results == null) {
            return null;
        }
        else {
            return results[1] || 0;
        }
    }
})($);

/**
 * Notes application.
 */
(function ($) {
    $(function () {

        /**
         * Notes repository which is capable of selecting, inserting, updating and deleting notes.
         */
        var notesRepository = function () {

            var notes;

            /**
             * loads all persisted notes from localStorage.
             * @returns {{idSequence: number}}
             */
            var loadNotes = function () {
                var serializedNotes = localStorage.getItem('notes');
                console.log("Load notes: " + serializedNotes);
                return serializedNotes === undefined || serializedNotes === null ? {idSequence: 0} : JSON.parse(serializedNotes);
            };

            /**
             * Gets a note with the given id.
             *
             * @param id the id of the note
             * @returns {*|{}} null or the object
             */
            var getNote = function (id) {
                var note = notes[id];
                if (note == undefined) {
                    return null;
                }
                return note;
            };

            /**
             * Save all notes.
             *
             * @returns {Array} the persisted notes
             */
            var saveNotes = function () {
                var serializedNotes = notes === undefined || notes === null ? "[]" : JSON.stringify(notes);
                localStorage.setItem('notes', serializedNotes);
                return notes;
            };

            /**
             * add a new note (id null || undefined) update a existing note;
             *
             * @param note the note to persist
             * @returns the persisted note
             */
            var putNote = function (note) {
                var id = note.id;
                if (id == null || id == undefined) {
                    notes.idSequence++;
                    id = notes.idSequence;
                    note.id = id;
                }
                notes[id] = note;
                saveNotes();
                return note;
            };

            /**
             * Deletes a given note.
             *
             * @param id if the note to be deleted
             * @return {Array} the updated notes
             */
            var deleteNote = function (id) {
                notes[id] = undefined;
                saveNotes();
            };

            var getNotes = function (sortedBy) {
                var ids = Object.keys(notes);
                var indexOfSequence = ids.indexOf('idSequence');
                if (indexOfSequence > -1) {
                    ids.splice(indexOfSequence, 1);
                }
                var notesArray = ids.map(function (key) {
                    return notes[key];
                });
                //Todo sortedBy umsetzten;

                return notesArray;
            };


            notes = loadNotes();

            // Return public interface.
            return {
                getNotes: getNotes,
                getNote: getNote,
                saveNotes: saveNotes,
                putNote: putNote,
                deleteNote: deleteNote
            };
        }();

        /**
         * Render the Data from the notes Array with Handelbarstemplates.
         */
        var renderData = function () {
            var generatedHtml = Handlebars.getTemplate('notes-template')(notesRepository.getNotes('date'));
            $('#notes-table').html(generatedHtml);
            registerEvents();
        };

        /**
         * Function for register all Events.
         */
        var registerEvents = function () {
            $('.edit-button').unbind('click').on('click', function (event) {
                toggleNoteEditable(event.target.getAttribute('data-note-id'));
            });

            $('.save-button').unbind('click').on('click', function (event) {
                saveNote(event.target.getAttribute('data-note-id'));
            });

            $('#create-note').unbind('click').on('click', function () {
                newNote();
            });
        };

        /**
         * Toggle isEditable on note at position of the noteIndex in Array notes.
         * @param noteId
         */
        var toggleNoteEditable = function (noteId) {
            var note = notesRepository.getNote(noteId);
            note.isEditable = !note.isEditable;
            console.log('Note ' + noteId + ' isEditable: ' + note.isEditable);
            notesRepository.saveNotes();
            renderData();
        };

        /**
         * save note data to the note at the noteIndex.
         * @param noteIndex
         */
        var saveNote = function (noteIndex) {
            var formData = new FormData(document.querySelector('#edit-form-note-' + noteIndex));
            console.log(formData);
            var note = notesRepository.getNote(noteIndex);

            note.content = $('#description-' + noteIndex).val();
            note.title = $('#title-' + noteIndex).val();
            note.due = $('#due-date-' + noteIndex).val()

            toggleNoteEditable(noteIndex);
        };

        var newNote = function () {
            var newNote = {
                id: null,
                title: '',
                content: '',
                finished: false,
                importance: 3,
                due: null,
                isEditable: true
            };
            notesRepository.putNote(newNote);
            renderData();
        };

        renderData();
    });
})(jQuery);

