'use strict';
(function (namespace){

    /**
     * Loads a JSON object from a local storage and initializes it with empty object if not present.
     * @param key the key of the local storage
     */
    var publicLoad = function (key) {
        var serializedObject = localStorage.getItem(key);
        var object = serializedObject ? JSON.parse(serializedObject) : {};
        if (!object || object === '' || object instanceof Array) { // array if for migration purpose
            object = {};
        }
        return object;
    };

    /**
     * Saves a JSON object and serializes it to local storage.
     * @param key key of the local storage
     * @param value the json object to be stored
     */
    var publicSave = function (key, value) {
        if (!value) {
            value = {};
        }
        var serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
    };

    namespace.localStorageUtil = {
        load: publicLoad,
        save: publicSave
    }

}(window.notesnamespace));