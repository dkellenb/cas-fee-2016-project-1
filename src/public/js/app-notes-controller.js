'use strict';

(function ($, notesnamespace) {

    var notesRepository = notesnamespace.notesRepository;
    var localStorageUtil = notesnamespace.localStorageUtil;

    const LOCAL_STORAGE_EDIT_MODE = 'notes-edit-modes';

    /**
     * Checks if the node with the given id is in edit mode.
     *
     * @param id the id
     * @returns {boolean} true if in edit mode
     */
    var privateIsInEditMode = function (id) {
        var persistedStates = localStorageUtil.load(LOCAL_STORAGE_EDIT_MODE);
        return persistedStates[id];
    };

    /**
     * Sets the edit mode of a note.
     *
     * @param id the id of the note
     * @param editMode true if in edit mode
     */
    var privateSetEditMode = function (id, editMode) {
        var allStates = localStorageUtil.load(LOCAL_STORAGE_EDIT_MODE);
        allStates[id] = editMode;
        localStorageUtil.save(LOCAL_STORAGE_EDIT_MODE, allStates);
    };

    /**
     * Clear the edit mode state (housekeeping).
     *
     * @param id the id of the state to be removed
     */
    var privateClearEditModeState = function (id) {
        var allStates = localStorageUtil.load(LOCAL_STORAGE_EDIT_MODE);
        delete allStates[id];
        localStorageUtil.save(LOCAL_STORAGE_EDIT_MODE, allStates);
    };

    /**
     * Extends a note object with the edit mode.
     *
     * @note the node to decorate
     * @return the same node
     */
    var privateDecorateWithState = function (note) {
        note.isEditable = privateIsInEditMode(note.id);
        return note;
    };

    /**
     * Sets the edit mode state to the object.
     *
     * @param note the note
     * @param editMode the edit mode
     */
    var privateSetNodeToEditMode = function (note, editMode) {
        note.isEditable = editMode;
        privateSetEditMode(note.id, editMode);
    };

    /**
     * Render Single Note in Note-Table
     * @param note Note for Render
     * @param placement 'top', 'bottom', 'replace'
     */
    var privateRenderSingleNote = function (note, placement) {
        var generatedHtml = Handlebars.getTemplate('note-template')(note);
        if ('replace' == placement) {
            privateDeregisterEvents(note);
            $('#note-' + note.id).replaceWith(generatedHtml);
        } else if ('top' == placement) {
            $('#notes-table').prepend(generatedHtml).show('fast');
        } else {
            $('#notes-table').append(generatedHtml).show('fast');
        }
        privateRegisterEvents(note);
    };

    /**
     * Redraws a single note.
     *
     * @param note the note
     */
    var privateRerenderSingleNote = function (note) {
        privateDeregisterEvents(note);
        privateDecorateWithState(note);
        privateRenderSingleNote(note, 'replace');
        privateRegisterEvents(note);
    };

    /**
     * Removes a single note with an animation.
     *
     * @param id the note to be removed.
     */
    var privateRenderRemoveSingleNote = function (id) {
        var element = $('#note-' + id);
        element.hide('fast', function(){ element.remove(); });
    };

    /**
     * Render all passed notes (replacing all previous notes if needed).
     *
     * @param notes all notes
     */
    var privateRenderAllNotes = function (notes) {
        privateDeregisterEvents();
        notes.forEach(function (note) {
           privateDecorateWithState(note);
        });
        var generatedHtml = Handlebars.getTemplate('notes-template')(notes);
        $('#notes-table').html(generatedHtml);
        privateRegisterEvents();
    };

    /**
     * Function for register all Events.
     */
    var privateRegisterEvents = function (note) {
        var prefix = note ? '#note-' + note.id + ' ' : '';
        $(prefix + '.action-edit').unbind('click').on('click', function (event) {
            privateEditNote(event.target.getAttribute('data-note-id'));
        });

        $(prefix + '.action-save').unbind('click').on('click', function (event) {
            privateSaveNote(event.target.getAttribute('data-note-id'));
        });

        $(prefix + '.action-delete').unbind('click').on('click', function (event) {
            privateDeleteNote(event.target.getAttribute('data-note-id'));
        });

        $(prefix + '.action-revert').unbind('click').on('click', function () {
            privateRevertNote(event.target.getAttribute('data-note-id'));
        });

        $(prefix + '.action-finished').unbind('click').on('click', function () {
            privateSetFinished(event.target.getAttribute('data-note-id'), event.target.getAttribute('data-note-finished'))
        });
    };

    /**
     * Function for deregister all Events.
     */
    var privateDeregisterEvents = function (note) {
        var prefix = note ? '#note-' + note.id + ' ' : '';
        $(prefix + '.action-edit').unbind('click');
        $(prefix + '.action-save').unbind('click');
        $(prefix + '.action-delete').unbind('click');
        $(prefix + '.action-revert').unbind('click');
        $(prefix + '.action-finished').unbind('click');
    };

    /**
     * Toggle isEditable on note at position of the noteIndex in Array notes.
     * @param noteId
     */
    var privateEditNote = function (noteId) {
        notesRepository.getNote(noteId, function (err, note) {
            if (!err) {
                privateSetNodeToEditMode(note, true);
                privateRerenderSingleNote(note);
                // TODO: window.scrollTo ...
            }
        });
    };

    /**
     * save note data to the note at the noteIndex.
     * @param noteId
     */
    var privateSaveNote = function (noteId) {
        notesRepository.getNote(noteId, function (err, note) {
            if (!err) {
                note.content = $('#description-' + noteId).val();
                note.title = $('#title-' + noteId).val();
                note.dueDate = $('#due-date-' + noteId).val();
                note.importance = $("input:radio[name='importance-" + noteId + "']:checked").val();
                note.isFinished = $("#notes-entry-" + noteId + "-finished").is(':checked');

                privateSetNodeToEditMode(note, false);
                notesRepository.saveNote(note, function (err, savedNote) {
                    if (!err) {
                        privateRerenderSingleNote(note);
                    }
                });
            }
        });
    };

    /**
     * Revert the content of the note => Just refresh.
     * @param noteId
     */
    var privateRevertNote = function(noteId) {
        notesRepository.getNote(noteId, function (err, note) {
            privateSetNodeToEditMode(note, false);
            privateRerenderSingleNote(note);
        });
    };

    /**
     * Create a new note.
     */
    var privateCreateNote = function() {
        notesRepository.createNote(function (err, note) {
            if (!err) {
                privateSetNodeToEditMode(note, true);
                privateRenderSingleNote(note, 'top');
                privateRegisterEvents(note);
            }
        });
    };

    /**
     * Toggle isEditable on note at position of the noteIndex in Array notes.
     * @param noteId
     */
    var privateDeleteNote = function (noteId) {
        notesRepository.deleteNote(noteId, function (err) {
            if (!err) {
                privateRenderRemoveSingleNote(noteId);
                privateClearEditModeState(noteId);
            }
        });
    };

    /**
     * Sets status to finished.
     *
     * @param noteId the note id
     * @param previousFinishedState
     */
    var privateSetFinished = function (noteId, previousFinishedState) {
        notesRepository.getNote(noteId, function (err, note) {
            if (!err) {
                note.isFinished = previousFinishedState !== "true" && previousFinishedState !== true;
                notesRepository.saveNote(note, function (err, savedNote) {
                   if (!err) {
                       privateRerenderSingleNote(savedNote);
                   }
                });
            }
        });
    };

    /**
     * If new nodes are coming in => add them at the end.
     * @param id the id of the new node
     */
    var publicOnExternalNoteCreation  = function (id) {
        notesRepository.getNote(id, function (err, note) {
            // already present?
            if ($('#note-' + id).length === 0) {
                privateRenderSingleNote(note, 'end');
            }
        });
    };

    /**
     * If the node has be update externally, then we have couple of scenarios:
     * - no edit mode: just update
     * - edit mode: notify the user. offer to reload or the keep the current state.
     * TODO (implement the notification)
     * @param id
     */
    var publicOnExternalNoteUpdate = function (id) {
        if (privateIsInEditMode(id)) {
            // TODO implement. At the moment: just replace
        }
        notesRepository.getNote(id, function (err, note) {
            if (!err) {
                privateRenderSingleNote(note, 'replace');
            }
        });
    };

    /**
     * If the node has be deleted externaly, then we have couple of scenarios:
     * - no edit mode: just delete
     * - edit mode: notify the user. offer to delete or to recreate with the same content
     * TODO (implement notification and handling)
     * @param id the id
     */
    var publicOnExternalNoteDelete = function (id) {
        if (privateIsInEditMode(id)) {
            // TODO implement. At the moment: just delete
        }
        privateRenderRemoveSingleNote(id);
        privateClearEditModeState(id);
    };

    var initialize = function () {
        // Bind create note
        $('.action-create').on('click', function () {
            privateCreateNote();
        });

        // Load notes
        notesRepository.searchNotes(null, null, null, function (err, notes) {
            if (!err) {
                privateRenderAllNotes(notes);
            }
        });
    };

    initialize();
    notesnamespace.notesController = {
        onExternalNoteCreation : publicOnExternalNoteCreation,
        onExternalNoteUpdate : publicOnExternalNoteUpdate,
        onExternalNoteDelete : publicOnExternalNoteDelete
    };
})
(jQuery, window.notesnamespace);
