'use strict';

/**
 * Color change.
 */
(function ($) {
    $(".change-style").on('click', function (event) {
        var desiredStyle = event.target.getAttribute('data-body-style');
        $("body").attr('class', desiredStyle);
    });
})(jQuery);