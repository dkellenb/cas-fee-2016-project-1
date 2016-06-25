'use strict';

(function ($, UUID, notesnamespace) {

    const LOCAL_STORAGE_EDIT_MODE = 'notes-edit-modes';

    // Constants for Data Key-Attributes
    const DATA_KEY_BUTTON_NOTE_ID = 'data-note-id';

    // dependencies
    var notesRepository = notesnamespace.notesRepository;
    var localStorageUtil = notesnamespace.localStorageUtil;
    var sortFilterRepository = notesnamespace.sortFilterRepository;

    var localNewNotes = [];

    /**
     * Class for representing the Buttons and CallBack Functions
     * @param buttonSelector Selector for the Button
     * @param callBack callBack Function
     * @constructor
     */
    function ButtonFunction(buttonSelector, callBack) {
        this.buttonSelector = buttonSelector;
        this.callBack = callBack;
    }

    //All Buttons in the Application
    const noteButtonFunctions = [
        new ButtonFunction('.action-edit', function (event) {
            privateEditNote(event.target.getAttribute(DATA_KEY_BUTTON_NOTE_ID));
        }),
        new ButtonFunction('.action-save', function (event) {
            privateSaveNote(event.target.getAttribute(DATA_KEY_BUTTON_NOTE_ID));
        }),
        new ButtonFunction('.action-delete', function (event) {
            privateDeleteNote(event.target.getAttribute(DATA_KEY_BUTTON_NOTE_ID));
        }),
        new ButtonFunction('.action-revert', function (event) {
            privateRevertNote(event.target.getAttribute(DATA_KEY_BUTTON_NOTE_ID));
        }),
        new ButtonFunction('.action-finished', function (event) {
            privateSetFinished(event.target.getAttribute(DATA_KEY_BUTTON_NOTE_ID), event.target.getAttribute('data-note-finished'));
        })
    ];

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
     * Clears the edit mode state (housekeeping).
     *
     * @param id the id of the state to be removed
     */
    var privateClearEditModeState = function (id) {
        var allStates = localStorageUtil.load(LOCAL_STORAGE_EDIT_MODE);
        delete allStates[id];
        localStorageUtil.save(LOCAL_STORAGE_EDIT_MODE, allStates);
    };

    /**
     * Returns the local new note.
     *
     * @param id the note id
     */
    var privateGetLocalNewNote = function (id) {
        return localNewNotes.find(function (entry) {
            return entry.id === id;
        });
    };

    /**
     * Clears the local persisted new notes (housekeeping).
     *
     * @param newNote the note id to be cleared
     */
    var privateClearNewNote = function (newNote) {
        privateClearEditModeState(newNote.id);
        localNewNotes.splice(localNewNotes.indexOf(newNote), 1);
        delete newNote.id;
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
     * Enum for Placements if rendering a SingleNote
     * @type {{REPALCE: string, NEW: string, APPEND: string}}
     */
    const SingleNotePlacement = {
        REPALCE: 'replace',
        NEW: 'new',
        APPEND: 'append'
    };
    /**
     * Render Single Note in Note-Table
     * @param note Note for Render
     * @param singleNotePlacement -> ENUM SingleNotePlacement
     */
    var privateRenderSingleNote = function (note, singleNotePlacement) {
        var generatedHtml = Handlebars.getTemplate('note-template')(note);
        if (SingleNotePlacement.REPALCE === singleNotePlacement) {
            privateDeregisterEvents(note);
            $('#note-' + note.id).replaceWith(generatedHtml);
        } else if (SingleNotePlacement.NEW === singleNotePlacement) {
            $('#new-notes').prepend(generatedHtml).show('fast');
        } else {
            $('#existing-notes').append(generatedHtml).show('fast');
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
        privateRenderSingleNote(note, SingleNotePlacement.REPALCE);
        privateRegisterEvents(note);
    };

    /**
     * Removes a single note with an animation.
     *
     * @param id the note to be removed.
     */
    var privateRenderRemoveSingleNote = function (id) {
        var element = $('#note-' + id);
        element.hide('fast', function () {
            element.remove();
        });
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
        $('#existing-notes').html(generatedHtml);
        privateRegisterEvents();
    };

    /**
     * Function for register all Events.
     */
    var privateRegisterEvents = function (note) {
        var prefix = note ? '#note-' + note.id + ' ' : '';

        noteButtonFunctions.forEach(function (buttonFunction) {
            console.log(prefix + buttonFunction.buttonSelector);
            $(prefix + buttonFunction.buttonSelector).unbind('click').on('click', buttonFunction.callBack);
        });
    };

    /**
     * Function for deregister all Events.
     */
    var privateDeregisterEvents = function (note) {
        var prefix = note ? '#note-' + note.id + ' ' : '';

        noteButtonFunctions.forEach(function (buttonFunction) {
            $(prefix + buttonFunction.buttonSelector).unbind('click');
        });
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
     * Updates the given note with the values from the UI.
     *
     * @param note the note to be updated
     * @param noteId the id from the note
     */
    var privateUpdateNoteFromForm = function (note, noteId) {
        note.content = $('#description-' + noteId).val();
        note.title = $('#title-' + noteId).val();
        note.dueDate = $('#due-date-' + noteId).val();
        note.importance = $("input:radio[name='importance-" + noteId + "']:checked").val();
        note.isFinished = $("#notes-entry-" + noteId + "-finished").is(':checked');
    };

    /**
     * save note data to the note at the noteIndex.
     * @param noteId
     */
    var privateSaveNote = function (noteId) {
        if (noteId.substr(0, 3) === 'new') {
            var newNote = privateGetLocalNewNote(noteId);
            privateUpdateNoteFromForm(newNote, noteId);
            privateClearNewNote(newNote);
            notesRepository.createNote(newNote, function (err, createdNote) {
                if (!err) {
                    privateRenderRemoveSingleNote(noteId);
                    // it will be added with socket events.
                }
            });
        } else {
            notesRepository.getNote(noteId, function (err, note) {
                if (!err) {
                    privateUpdateNoteFromForm(note, noteId);
                    privateSetNodeToEditMode(note, false);
                    notesRepository.saveNote(note, function (err, savedNote) {
                        if (!err) {
                            // nothing needed to be done. will be updated with socket events
                        }
                    });
                }
            });
        }
    };

    /**
     * Revert the content of the note => Just refresh.
     * @param noteId
     */
    var privateRevertNote = function (noteId) {
        notesRepository.getNote(noteId, function (err, note) {
            privateSetNodeToEditMode(note, false);
            privateRerenderSingleNote(note);
        });
    };

    /**
     * Create a new note.
     */
    var privateCreateNote = function () {
        notesRepository.getNoteModel(function (err, note) {
            if (!err) {
                note.id = 'new-' + UUID.generate();
                localNewNotes.push(note);
                privateSetNodeToEditMode(note, true);
                privateRenderSingleNote(note, SingleNotePlacement.NEW);
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
     * Sorts by a given property
     *
     * @param property the property
     * @param direction 'asc' or 'desc'
     */
    var sortByProperty = function (property, direction) {
        return function (a, b) {
            var factor = 'asc' === direction ? 1 : -1;
            if (typeof a[property] == "number") {
                return (a[property] - b[property]);
            } else {
                return ((a[property] < b[property]) ? factor * -1 : ((a[property] > b[property]) ? factor : 0));
            }
        };
    };


    /**
     * If new nodes are coming in => add them at the end.
     * @param id the id of the new node
     */
    var publicOnExternalNoteCreation = function (id) {
        notesRepository.getNote(id, function (err, note) {
            // already present?
            if ($('#note-' + id).length === 0) {
                privateRenderSingleNote(note, SingleNotePlacement.APPEND);
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
                privateRenderSingleNote(note, SingleNotePlacement.REPALCE);
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

    /**
     * Reload all notes.
     */
    var publicReloadNotes = function () {
        var sortConfiguration = sortFilterRepository.getSort();
        var filterConfiguration = sortFilterRepository.getFilter();
        notesRepository.getNotes(function (err, notes) {
            if (!err) {
                // filter
                if (filterConfiguration.attribute !== 'isFinished') {
                    notes = notes.filter(function (entry) {
                        return !entry.isFinished
                    });
                }

                // sort
                if (sortConfiguration.direction === 'asc' || sortConfiguration.direction === 'desc') {
                    notes = notes.sort(sortByProperty(sortConfiguration.attribute, sortConfiguration.direction));
                }

                // merge with the local ones
                var displayNotes = localNewNotes.concat(notes);

                // rerender
                privateRenderAllNotes(displayNotes);
            }
        });
    };

    /**
     * Initializes the application.
     */
    var initialize = function () {
        // Bind create note
        $('.action-create').on('click', function () {
            privateCreateNote();
        });

        // Load notes
        publicReloadNotes();
    };


    initialize();
    notesnamespace.notesController = {
        onExternalNoteCreation: publicOnExternalNoteCreation,
        onExternalNoteUpdate: publicOnExternalNoteUpdate,
        onExternalNoteDelete: publicOnExternalNoteDelete,
        reloadNotes: publicReloadNotes
    };
})
(jQuery, UUID, window.notesnamespace);
