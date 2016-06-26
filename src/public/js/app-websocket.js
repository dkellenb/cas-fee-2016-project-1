'use strict';

(function (io, namespace) {
    /**
     * Websocket handling.
     */
    var socket = io('/');
    socket.on('created', function (idObject) {
        console.log('created: ' + idObject.id);
        if (idObject.senderId !== namespace.socket.id) {
            namespace.notesController.onExternalNoteCreation(idObject.id);
        }
    });
    socket.on('deleted', function (idObject) {
        console.log('deleted: ' + idObject.id);
        if (idObject.senderId !== namespace.socket.id) {
            namespace.notesController.onExternalNoteDelete(idObject.id);
        }
    });
    socket.on('updated', function (idObject) {
        console.log('updated: ' + idObject.id);
        if (idObject.senderId !== namespace.socket.id) {
            namespace.notesController.onExternalNoteUpdate(idObject.id);
        }
    });
    namespace.socket = socket;
})(io, window.notesnamespace);