'use strict';

/**
 * Websocket handling.
 */
var socket = io('/');
socket.on('created', function(msg){
    console.log('created: ' + msg);
});
socket.on('deleted', function(msg){
    console.log('deleted: ' + msg);
});

socket.on('updated', function(msg){
    console.log('updated: ' + msg);
});