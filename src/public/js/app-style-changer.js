'use strict';

/**
 * Color change.
 */
(function ($, namespace) {
    // localStorageKey
    const COLOR_LOCAL_STORAGE_KEY = 'notes-color';

    // dependency
    var localStorageUtil = namespace.localStorageUtil;

    var privateInitialize = function() {
        $(".change-style").on('click', function (event) {
            var desiredStyle = event.target.getAttribute('data-body-style');
            $("body").attr('class', desiredStyle);
            localStorageUtil.save(COLOR_LOCAL_STORAGE_KEY, desiredStyle);
        });

        var style = localStorageUtil.load(COLOR_LOCAL_STORAGE_KEY);
        if (!style || typeof style != 'string') {
            style = 'blue-style';
        }
        $("body").attr('class', style);
    };

    privateInitialize();

})(jQuery, window.notesnamespace);