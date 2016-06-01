'use strict';

/**
 * Handlebars configuration and extensions.
 */
(function (Handlebars) {
    var DateFormats = {
        short: "DD.MM.YYYY",
        long: "dddd DD.MM.YYYY HH:mm"
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

            var notes = loadNotes();

            /**
             * loads all persisted notes from localStorage.
             * @returns {{idSequenze: number}}
             */
            var loadNotes = function () {
                var serializedNotes = localStorage.getItem('notes');
                console.log("Load notes: " + serializedNotes);
                return serializedNotes === undefined || serializedNotes === null ? {idSequenze: 1} : JSON.parse(serializedNotes);
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
             * add a new node (id null || undefined) update a existing node;
             *
             * @param note the note to persist
             * @returns the persisted note
             */
            var putNode = function (note) {
                var id = note.id;
                if (id == null || id == undefined) {
                    notes.idSequenze++;
                    id = notes.idSequenze;
                    node.id = id;
                }
                notes[id] = node;
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
                nodes[id] = undefined;
                saveNotes();
            };

            // Return public interface.
            return {
                getNote: getNote,
                saveNotes: saveNotes,
                addNode: putNode,
                deleteNote: deleteNote
            };
        }();

        var notes = notesRepository.getNotes();

        /**
         * Render the Data from the notes Array with Handelbarstemplates.
         */
        var renderData = function () {
            var generatedHtml = Handlebars.getTemplate('notes-template')(notes);
            $('#notes-table').html(generatedHtml);
            registerEvents();
        };

        /**
         * Function for register all Events.
         */
        var registerEvents = function () {
            $('.edit-button').on("click", function (event) {
                toggleNoteEditable(event.target.getAttribute("data-note-index"));
            });

            $('.save-button').on("click", function (event) {
                saveNote(event.target.getAttribute("data-note-index"));
            });
        };

        /**
         * Toggle isEditable on note at position of the noteIndex in Array notes.
         * @param noteIndex
         */
        var toggleNoteEditable = function (noteIndex) {
            notes[noteIndex].isEditable = !notes[noteIndex].isEditable;
            console.log('Note ' + noteIndex + ' isEditable: ' + notes[noteIndex].isEditable);
            renderData();
        };

        /**
         * save note data to the node at the noteIndex.
         * @param noteIndex
         */
        var saveNote = function (noteIndex) {
            var formData = new FormData(document.querySelector('#edit-form-note-' + noteIndex));
            console.log(formData);
            toggleNoteEditable(noteIndex);
        };

        renderData();
    });
})(jQuery);

