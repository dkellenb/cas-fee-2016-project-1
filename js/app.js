'use strict';

/**
 * Handlebars configuration and extensions.
 */
(function (Handlebars) {
    var DateFormats = {
        short: "DD.MM.YYYY",
        long: "dddd DD.MM.YYYY HH:mm",
        input: "YYYY-MM-DD"
    };
    Handlebars.registerHelper("formatDate", function(datetime, format) {
        if (moment) {
            // can use other formats like 'lll' too
            format = DateFormats[format] || format;
            return moment(datetime).format(format);
        }
        else {
            return datetime;
        }
    });

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

/**
 * Notes application.
 */
(function ($) {
    $(function () {
        var notes = [
            {
                title: "CAS-FEE Projekt bearbeiten",
                content: "Hier ist ein Text welcher einen möglichen Inhalt einer Notiz darstellt. Dieser kann relative sehr gross sein. Die Idee ist dass durch einen Klick (derzeit Hover) der Inhalt sichtbar oder unsichtbar wird. Natürlich kann dieser Text sehr sehr lange werden und muss entsprechend in der kleinen Ansicht mit Ellipsis dargestellt werden.",
                finished: false,
                importance: 2,
                due: moment().add(1, 'days'),
                isEditable: false
            },
            {
                title: "Einkaufen",
                content: "- Butter\n- Bier\n- Eier\n- Brot",
                finished: true,
                importance: 4,
                due: moment().add(3, 'days'),
                isEditable: false
            }
        ];

        /**
         * Render the Data from the notes Array with Handelbarstemplates.
         */
        var renderData = function () {
            var generatedHtml = Handlebars.getTemplate('notes-template')(notes);
            $('#notes-table').html(generatedHtml);
            registerEvents();
        };

        /**
         * Function for register all Events.
         */
        var registerEvents = function () {
            $('.edit-button').on("click", function (event) {
                toggleNoteEditable(event.target.getAttribute("data-note-index"));
            });

            $('.save-button').on("click", function (event) {
                saveNote(event.target.getAttribute("data-note-index"));
            });
        };

        /**
         * Toggle isEditable on note at position of the noteIndex in Array notes.
         * @param noteIndex
         */
        var toggleNoteEditable = function (noteIndex) {
            notes[noteIndex].isEditable = !notes[noteIndex].isEditable;
            console.log('Note ' + noteIndex + ' isEditable: ' + notes[noteIndex].isEditable);
            renderData();
        };

        /**
         * save note data to the node at the noteIndex.
         * @param noteIndex
         */
        var saveNote = function (noteIndex) {
            var formData = new FormData(document.querySelector('#edit-form-note-' + noteIndex));
            console.log(formData);
            toggleNoteEditable(noteIndex);
        };
        renderData();
    });

    Handlebars.getTemplate = function (name) {
        if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
            $.ajax({
                url: 'hbs/' + name + '.hbs',
                success: function (data) {
                    if (Handlebars.templates === undefined) {
                        Handlebars.templates = {};
                    }
                    Handlebars.templates[name] = Handlebars.compile(data);
                },
                async: false
            });
        }
        return Handlebars.templates[name];
    };

})(jQuery);

