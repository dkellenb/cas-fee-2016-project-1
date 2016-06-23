'use strict';

var notesController = window.notesnamespace.notesController;

/**
 * Websocket handling.
 */
var socket = io('/');
socket.on('created', function(idObject){
    console.log('created: ' + idObject.id);
    notesController.onExternalNoteCreation(idObject.id);
});
socket.on('deleted', function(idObject){
    console.log('deleted: ' + idObject.id);
    notesController.onExternalNoteDelete(idObject.id);
});

socket.on('updated', function(idObject){
    console.log('updated: ' + idObject.id);
    notesController.onExternalNoteUpdate(idObject.id);
});