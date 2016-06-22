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
            this.createDate = new Date();
        }
    }

    /**
     * Notes repository which is capable of selecting, inserting, updating and deleting notes.
     * @type {{searchNotes, getNote, persistNote, deleteNote}}
     */
    var notesRepository = function () {

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

        // Return public interface.
        return {
            searchNotes: publicSearchNote,
            getNote: publicGetNote,
            saveNote: publicSaveNote,
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
            filterBarController.initialize();
        };


        /**
         * Render the Data from the notes Array with Handelbarstemplates.
         */
        var privateRenderData = function () {
            var activSortButton = filterBarController.getActiveSortButton();
            var activFilterButton = filterBarController.getActiveFilterButton();
            var generatedHtml = Handlebars.getTemplate('notes-template')(notesRepository.searchNotes(activSortButton.name, activSortButton.asc, activFilterButton.name));
            $('#notes-table').html(generatedHtml);
            privateRegisterEvents();
        };

        /**
         * Render Single Note in Note-Table
         * @param note Note for Render
         * @param replace true = Replace existing / false = place at beginning of table new Note
         */
        var privateRenderSingleNote = function (note, replace) {
            var generatedHtml = Handlebars.getTemplate('note-template')(note);
            if (replace) {
                $('#note-' + note.id).replaceWith(generatedHtml);
            } else {
                $('#notes-table').prepend(generatedHtml);
            }
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

            $('.action-delete').unbind('click').on('click', function (event) {
                privateDeleteNote(event.target.getAttribute('data-note-id'));
            });

            $('.action-create').unbind('click').on('click', function () {
                privateNewNote();
            });

            $('.action-revert').unbind('click').on('click', function () {
                privateRevertNote(event.target.getAttribute('data-note-id'));
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
            privateRenderSingleNote(notesRepository.saveNote(privateToggleNodeEditMode(notesRepository.getNote(noteId))), true);
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
            privateRenderSingleNote(note,true);
        };

        var privateRevertNote = function(noteId){
            var note = notesRepository.getNote(noteId);
            note.isEditable=false;
            privateRenderSingleNote(note,true);
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
            privateRenderSingleNote(newNote, false);
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

        var filterBarController = function ($) {
            var activeSortButton = {
                name: null,
                asc: true,
                countClicks: 0
            };

            var activFilterButton = {
                name: 'finished',
                activ: true
            };

            var init = function () {
                privateRegisterEvents();
            };

            var privatePerformSortButtonClick = function (event) {
                var buttonName = event.target.textContent;
                if (activeSortButton.name === buttonName) {
                    if (activeSortButton.countClicks > 1) {
                        activeSortButton.name = null;
                        activeSortButton.countClicks = 0;
                        activeSortButton.asc = true;
                        event.target.className = 'sort-button sort-inactive sort-asc'
                    } else {
                        activeSortButton.countClicks++;
                        activeSortButton.asc = false;
                        event.target.className = 'sort-button sort-active sort-desc'
                    }
                } else {
                    activeSortButton.name = buttonName;
                    activeSortButton.countClicks = 1;
                    activeSortButton.asc = true;
                    event.target.className = 'sort-button sort-active sort-asc'
                }

                $('.sort-button').not(event.target).attr('class', 'sort-button sort-inactive sort-asc');
                privateRenderData();
            };


            var privatePerformFilterButtonClick = function (event) {
                var buttonName = event.target.textContent;

                if (activFilterButton.name === buttonName) {
                    activFilterButton.name = null;
                    event.target.className = 'filter-button filter-inactive';
                } else {
                    activFilterButton.name = buttonName;
                    event.target.className = 'filter-button filter-active';
                }
                $('.filter-button').not(event.target).attr('class', 'filter-button filter-inactive');
                privateRenderData();
            };


            var privateRegisterEvents = function () {
                $('.sort-button').unbind('click').on('click', function (event) {
                    privatePerformSortButtonClick(event);
                });

                $('.filter-button').unbind('click').on('click', function (event) {
                    privatePerformFilterButtonClick(event);
                });
            };

            var publicGetActiveSortButton = function () {
                return activeSortButton;
            };

            var publicGetActiveFilterButton = function () {
                return activFilterButton;
            };

            return {
                initialize: init,
                getActiveSortButton: publicGetActiveSortButton,
                getActiveFilterButton: publicGetActiveFilterButton
            }
        }($);

        return {
            initialize: publicInitialize
        }
    }($, notesRepository);

    overviewController.initialize();
})
(jQuery, moment);

var socket = io('/');
socket.on('created', function(msg){
    console.log('created: ' + msg);
});
socket.on('deleted', function(msg){
    console.log('created: ' + msg);
});

socket.on('updated', function(msg){
    console.log('created: ' + msg);
});