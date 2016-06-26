'use strict';

/**
 * GOAL: Handlebars extensions.
 */

/**
 * Date format extension.
 */
(function (Handlebars) {
    const DateFormats = {
        short: 'DD.MM.YYYY',
        long: 'dddd DD.MM.YYYY HH:mm',
        input: 'YYYY-MM-DD'
    };

    Handlebars.registerHelper("formatDate", function (datetime, format) {
        if (moment) {
            // can use other formats like 'lll' too
            if (!datetime) {
                return '';
            }
            format = DateFormats[format] || format;
            return moment(datetime).format(format);
        }
        else {
            return datetime;
        }
    });
})(Handlebars);

/**
 * Line brake extension.
 */
(function (Handlebars) {
    // replace \r\n with <br> tag. (bypass default escaping by manually do the escaping)
    Handlebars.registerHelper('lineBreakReplacer', function (content) {
        var escapedContent = Handlebars.Utils.escapeExpression(content);
        var lineBreakPattern = /\r\n?|\n/g;
        return new Handlebars.SafeString(escapedContent.replace(lineBreakPattern, '<br>'));
    });
})(Handlebars);

/**
 * Register keyword countdownLoop -> {{countdownLoop 10}}block{{/countdownLoop}} repeat the block 10 times. index can be accessed with {{this}}
 */
(function (Handlebars) {
    Handlebars.registerHelper('countdownLoop', function (n, block) {
        var accum = '';
        const indexKey = 'countdownLoopIndex';
        for (var i = n; i > 0; --i) {
            this[indexKey] = i;
            accum += block.fn(this);
        }
        this[indexKey] = undefined;
        return accum;
    });
})(Handlebars);

/**
 * If condition extension.
 */
(function (Handlebars) {
    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });
})(Handlebars);