'use strict';

var _websocket = null;

function publicRegister(websocket) {
    _websocket = websocket;
}

function publicGet() {
    return _websocket;
}

function publicEmitMessage(messageType, id, senderId) {
    _websocket.emit(messageType, {id: id, senderId: senderId});
}

function publicIsReady() {
    return _websocket !== null || _websocket !== undefined;
}

module.exports = {
    register: publicRegister,
    isReady: publicIsReady,
    emitMessage: publicEmitMessage
};
