'use strict';

/**
 * Handlebars configuration and extensions.
 */
(function (Handlebars, $) {
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

    Handlebars.registerPartial('noteTemplate', Handlebars.getTemplate('note-template'))

})(Handlebars, jQuery);

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
})(jQuery);

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
(function ($, moment) {

    /**
     * Class Note.
     */
    class Note {
        constructor(title, content, importance, finished, due) {
            this.id = null;
            this.title = "" + title;
            this.content = "" + content;
            this.importance = importance > 0 && importance <= 5 ? importance : 3;
            this.finished = finished === true;
            this.due = due !== null ? moment(due).format('YYYY-MM-DD') : null;
            this.isEditable = true;
        }
    }

        /**
         * Controller for sorting the Lists
         */
        var sortController = function () {

            const LOCAL_SORAGE_BUTTON_KEY = 'buttons';

            function Button(label, aktive) {
                this.label = label;
                this.aktive = aktive;
            }

            function FilterButton(label, aktive, filterFunction) {
                Button.call(label, aktive);
                this.filterFunction = filterFunction;
            }

            function SortButton(label, aktive, asc, quantifier, sortFunction) {
                Button.call(label, aktive);
                this.quantifier = quantifier;
                this.asc = asc;
                this.sortFunction = sortFunction;
            }

            var privateLoadButtons = function () {
                var serializedButtons = localStorage.getItem(LOCAL_SORAGE_BUTTON_KEY);
                console.log("Load buttons: " + serializedButtons);
                return serializedButtons === undefined || serializedButtons === null ? privateInitButtons() : JSON.parse(serializedButtons);
            };

            var privateSaveButtons = function (buttons) {
                if (buttons === undefined || buttons === null) {
                    buttons = privateInitButtons();
                }
                var serializedButtons = JSON.stringify(buttons);
                localStorage.setItem(LOCAL_SORAGE_BUTTON_KEY, serializedButtons);
                return notes;
            };

            var privateInitButtons = function () {
                return {
                    filterButtons: [
                        new FilterButton('finished', false, function (note) {
                            return note.finished;
                        })
                    ],
                    sortButtons: [
                        new SortButton('created', false, true, 0, function (noteA, noteB) {
                            if (noteA.due == noteB.due) {
                                return 0;
                            }
                            return (this.asc && noteA.due < noteB.due) ? -1 : 1;
                        }),

                        new SortButton('importance', false, true, 0, function (noteA, noteB) {
                            if (noteA.importance == noteB.importance) {
                                return 0;
                            }
                            return (this.asc && noteA.importance < noteB.importance) ? -1 : 1;
                        })
                    ]
                };
            };

            var publicFilterAndSortNotes = function (notes) {
                return notes;
            };

            var publicGetButtons = function () {
                return privateLoadButtons();
            };

            return {
                publicGetButtons: publicGetButtons,
                publicFilterAndSortNotes: publicFilterAndSortNotes
            };
        }();

        /**
         * Notes repository which is capable of selecting, inserting, updating and deleting notes.
         * @type {{searchNotes, getNote, persistNote, deleteNote}}
         */
        var notesRepository = function (sortController) {

            const LOCAL_SORAGE_NOTES_KEY = 'notes';
            const LOCAL_SORAGE_NOTES_SEQUENCE_KEY = 'noteIdSequence';

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

                return sortController.publicFilterAndSortNotes(notes);
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
            privatePutNote(key, undefined);
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

            // Return public interface.
            return {
                searchNotes: publicSearchNote,
                getNote: publicGetNote,
                saveNote: publicSaveNote,
                deleteNote: publicDeleteNote
            };
        }(sortController);

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
            $('.action-edit').unbind('click').on('click', function (event) {
                privateEditNote(event.target.getAttribute('data-note-id'));
            });

            $('.action-save').unbind('click').on('click', function (event) {
                privateSaveNote(event.target.getAttribute('data-note-id'));
            });

            $('.action-delete').unbind('click').on('click', function(event) {
                privateDeleteNote(event.target.getAttribute('data-note-id'));
            });

            $('.action-create').unbind('click').on('click', function () {
                privateNewNote();
            });

            $('.action-revert').unbind('click').on('click', function () {
                privateRenderData();
            });
            
            $('.action-finished').unbind('click').on('click', function () {
                privateSetFinished(event.target.getAttribute('data-note-id'), event.target.getAttribute('data-note-finished'))
            });
        };

        /**
         * Toggle isEditable on note at position of the noteIndex in Array notes.
         * @param noteId
         */
        var privateEditNote = function (noteId) {
            notesRepository.saveNote(privateToggleNodeEditMode(notesRepository.getNote(noteId)));
            privateRenderData();
        };


        /**
         * save note data to the note at the noteIndex.
         * @param noteId
         */
        var privateSaveNote = function (noteId) {
            var note = notesRepository.getNote(noteId);
            note.content = $('#description-' + noteId).val();
            note.title = $('#title-' + noteId).val();
            note.due = $('#due-date-' + noteId).val();
            note.importance = $("input:radio[name='importance-" + noteId + "']:checked").val();
            note.finished = $("#notes-entry-" + noteId + "-finished").is(':checked');
            console.log(note);

            notesRepository.saveNote(privateToggleNodeEditMode(note));
            privateRenderData();
        };

        /**
         * Toggle isEditable on note at position of the noteIndex in Array notes.
         * @param noteId
         */
        var privateDeleteNote = function (noteId) {
            notesRepository.deleteNote(noteId);
            privateRenderData();
        };

        /**
         * Creates a new note and sets it into edit state.
         */
        var privateNewNote = function () {
            var newNote = new Note('', '', 3, false, null);
            notesRepository.saveNote(newNote);
            privateRenderData();
        };

        var privateSetFinished = function (noteId, previousFinishedState) {
            var note = notesRepository.getNote(noteId);
            note.finished = previousFinishedState !== "true" && previousFinishedState !== true;
            notesRepository.saveNote(note);
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
})(jQuery, moment);
