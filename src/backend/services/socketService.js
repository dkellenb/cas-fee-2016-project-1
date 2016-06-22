'use strict';

var _websocket = null;

function publicRegister(websocket) {
    _websocket = websocket;
}

function publicGet() {
    return _websocket;
}

module.exports = {
    register: publicRegister,
    get: publicGet
};
