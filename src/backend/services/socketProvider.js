'use strict';

/**
 * Module supporting web sockets on server side using socket.io.
 */

var _websocket = null;

/**
 * Register a web socket.
 * @param websocket
 */
function publicRegister(websocket) {
    _websocket = websocket;
}

/**
 * Emit a message to clients sharing the sender.
 *
 * @param messageType the message channel / type
 * @param id the id of the note that has been updated
 * @param senderId the identification of the sender
 */
function publicEmitMessage(messageType, id, senderId) {
    _websocket.emit(messageType, {id: id, senderId: senderId});
}

/**
 * Checks if the web socket is ready to accept messages.
 */
function publicIsReady() {
    return _websocket !== null || _websocket !== undefined;
}

module.exports = {
    register: publicRegister,
    isReady: publicIsReady,
    emitMessage: publicEmitMessage
};
