'use strict';

/**
 * Handlebars configuration and extensions.
 */
(function (Handlebars) {
    var DateFormats = {
        short: "DD.MM.YYYY",
        long: "dddd DD.MM.YYYY HH:mm"
    };
    Handlebars.registerHelper("formatDate", function(datetime, format) {
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

    Handlebars.getTemplate = function(name) {
        if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
            $.ajax({
                url : 'hbs/' + name + '.hbs',
                success : function(data) {
                    if (Handlebars.templates === undefined) {
                        Handlebars.templates = {};
                    }
                    Handlebars.templates[name] = Handlebars.compile(data);
                },
                async : false
            });
        }
        return Handlebars.templates[name];
    };

})(Handlebars);

/**
 * JQuery extension.
 */
(function ($) {
    $.urlParam = function(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results==null){
            return null;
        }
        else{
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

            /**
             * Gets all persisted notes.
             *
             * @returns {Array} the persisted notes
             */
            var getNotes = function () {
                var serializedNotes = localStorage.getItem('notes');
                console.log("Load notes: " + serializedNotes);
                var notes = serializedNotes === undefined || serializedNotes === null ? [] : JSON.parse(serializedNotes);
                return notes;
            };

            /**
             * Gets a note with the given id.
             *
             * @param id the id of the note
             * @returns {*|{}} null or the object
             */
            var getNote = function (id) {
                var _id = parseInt(id);
                return getNotes().find(function (note) { return note.id === _id; });
            };

            /**
             * Save all notes.
             *
             * @param notes saves all notes.
             * @returns {Array} the persisted notes
             */
            var saveNotes = function (notes) {
                var serializedNotes = notes === undefined || notes === null ? "[]" : JSON.stringify(notes);
                localStorage.setItem('notes', serializedNotes);
                return notes;
            };

            /**
             * Saves a given note. Updates an existing persisted one.
             *
             * @param note the note to persist
             * @returns the persisted note
             */
            var saveNote = function (note) {
                var notes = getNotes();
                if (note.id === undefined || note.id === null) {
                    note.id = notes.length === 0 ? 1 : Math.max.apply(Math, notes.map(function (n) { return n.id })) + 1;
                    notes.push(note);
                } else {
                    var index = notes.findIndex(function (noteEntry) {
                        return noteEntry.id === note.id
                    });
                    if (index > -1) {
                        notes[index] = note;
                    } else {
                        notes.push(note);
                    }
                }
                saveNotes(notes);
                return note;
            };

            /**
             * Deletes a given note.
             *
             * @param id if the note to be deleted
             * @return {Array} the updated notes
             */
            var deleteNote = function (id) {
                var notes = getNotes();
                var index = notes.findIndex(function (noteEntry) { return noteEntry.id === note.id });
                if (index > -1) {
                    notes.splice(index, 1);
                    saveNotes(notes);
                }
                return notes;
            };

            // Return public interface.
            return {
                getNotes: getNotes,
                getNote: getNote,
                saveNotes: saveNotes,
                saveNote: saveNote,
                deleteNote: deleteNote
            };
        }();

        /**
         * The edit form controller. Dependes on:
         * - notesRepository
         */
        var formController = function ($, notesRepository) {

            /**
             * Sets all values of the note to the form.
             * 
             * @param note
             */
            var setNote = function (note) {
                $('title').text("Edit note " + note.id);
                $('.title').text("Edit note " + note.id);
                $('#title').val(note.title);
                $('#description').val(note.content);
                // TODO importance
                $('#dateTo').val(note.due);
            };

            /**
             * Retrieve note values from the form.
             *
             * @return note
             */
            var getNote = function () {
                // TODO add some input validation
                return {
                    id: $.urlParam('id'),
                    title: $('#title').val(),
                    content: $('#description').val(),
                    finished: false,
                    importance: parseInt($("input:radio[name=importance]:checked").val()),
                    due: moment($("#dateTo").val())
                };
            };

            /**
             * Persists the form.
             */
            var save = function () {
                var note = getNote();
                console.log(note);
                notesRepository.saveNote(note);
                window.location.href = "./";
            };

            /**
             * Initializes the form.
             */
            var initialize = function () {
                $('#save').on("click", function(event) {
                    save();
                });
                
                var id = $.urlParam('id');
                if (id === null || id === undefined) {
                    return;
                }
                
                var note = notesRepository.getNote(id);
                if (note === null || note === undefined) {
                    return;
                }

                setNote(note);
            };

            // Return public interface.
            return {
                initialize: initialize
            }

        }($, notesRepository);

        var overviewController = function ($, notesRepository) {

            var renderData = function (notes) {
                var generatedHtml = Handlebars.getTemplate('notes-template')(notes);
                $('#notes-table').html(generatedHtml);
            };

            var registerEvents = function () {
                $('.edit-button').on("click",function(event) {
                    toggleNodeEditable(event.target.getAttribute("data-note-id"));
                });
            };

            var toggleNodeEditable = function (id) {
                window.location.href = "./edit.html?id=" + id;
            };

            var initialize = function () {
                var notes = notesRepository.getNotes();
                renderData(notes);
                registerEvents();
            };

            // Return public interface.
            return {
                initialize: initialize
            }

        }($, notesRepository);

        if (window.location.href.indexOf('edit.html') > -1) {
            formController.initialize();
        } else {
            overviewController.initialize();
        }

    });

})(jQuery);

