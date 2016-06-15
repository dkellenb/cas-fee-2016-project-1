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

    Handlebars.registerPartial('noteTemplate',Handlebars.getTemplate('note-template'))

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
 * Color change.
 */
(function ($) {
    $(".change-style").on('click', function (event) {
        var desiredStyle = event.target.getAttribute('data-body-style');
        $("body").attr('class', desiredStyle);
    });
})(jQuery);

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
             * Gets all persisted notes.
             *
             * @returns {Array} the persisted notes
             */
            var publicSearchNote = function () {

                var notes = privateLoadNotes();
                var ids = Object.keys(notes);
                console.log(ids);
                var notesArray = ids.map(function (key) {
                    return notes[key];
                });
                //Todo sortedBy umsetzten;

                return notesArray;
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
            var publicPersistNote = function (note) {
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
                privatePutNote(key, undefined);
            };

            /**
             * loads all persisted notes from localStorage as a map<noteId,Note>.
             * @returns {map<number,{}>} map<noteId,Note>
             */
            var privateLoadNotes = function () {
                var serializedNotes = localStorage.getItem('notes');
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
                localStorage.setItem('notes', serializedNotes);
                return notes;
            };

            /**
             * get Next Id from note sequence in localStorage
             * @returns {number} noteId
             */
            var privateNextNoteId = function () {
                var sequence = localStorage.getItem('noteIdSequence');
                if (sequence == undefined || sequence == null) {
                    sequence = 0;
                }
                sequence++;
                localStorage.setItem('noteIdSequence', sequence);

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

            // Return public interface.
            return {
                searchNotes: publicSearchNote,
                getNote: publicGetNote,
                persistNote: publicPersistNote,
                deleteNote: publicDeleteNote
            };
        }();

        /**
         * The edit form controller. Dependes on:
         * - notesRepository
         */

        var overviewController = function ($, notesRepository) {

            var publicInitialize = function () {
                privateRenderData();
            };


            /**
             * Render the Data from the notes Array with Handelbarstemplates.
             */
            var privateRenderData = function () {
                var generatedHtml = Handlebars.getTemplate('notes-template')(notesRepository.searchNotes('date'));
                $('#notes-table').html(generatedHtml);
                privateRegisterEvents();
            };

            /**
             * Function for register all Events.
             */
            var privateRegisterEvents = function () {
                $('.edit-button').unbind('click').on('click', function (event) {
                    privateEditNote(event.target.getAttribute('data-note-id'));
                });

                $('.save-button').unbind('click').on('click', function (event) {
                    privateSaveNote(event.target.getAttribute('data-note-id'));
                });

                $('#create-note').unbind('click').on('click', function () {
                    privateNewNote();
                });
            };

            /**
             * Toggle isEditable on note at position of the noteIndex in Array notes.
             * @param noteId
             */
            var privateEditNote = function (noteId) {
                notesRepository.persistNote(privateToggleNodeEditMode(notesRepository.getNote(noteId)));
                privateRenderData();
            };


            /**
             * save note data to the note at the noteIndex.
             * @param noteId
             */
            var privateSaveNote = function (noteId) {
                var formData = new FormData(document.querySelector('#edit-form-note-' + noteId));
                console.log(formData);
                var note = notesRepository.getNote(noteId);

                note.content = $('#description-' + noteId).val();
                note.title = $('#title-' + noteId).val();
                note.due = $('#due-date-' + noteId).val();

                notesRepository.persistNote(privateToggleNodeEditMode(note));
                privateRenderData();
            };

            var privateNewNote = function () {
                var newNote = {
                    id: null,
                    title: '',
                    content: '',
                    finished: false,
                    importance: 3,
                    due: null,
                    isEditable: true
                };
                notesRepository.persistNote(newNote);
                privateRenderData();
            };

            /**
             * toggle isEditable boolean of note
             * @param note
             * @returns {*}
             */
            var privateToggleNodeEditMode = function (note) {
                note.isEditable = !note.isEditable;
                console.log('Note ' + note.id + ' isEditable: ' + note.isEditable);
                return note;
            };

            return {
                initialize: publicInitialize
            }
        }($, notesRepository);

        overviewController.initialize();
    });
})(jQuery);

