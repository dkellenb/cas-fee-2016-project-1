'use strict';

(function ($, moment, notesnamespace) {

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
    }($, notesnamespace.notesRepository);

    overviewController.initialize();
})
(jQuery, moment, window.notesnamespace);
