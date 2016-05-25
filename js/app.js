'use strict';

/**
 * Notes application
 */
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

(function ($) {
    $(function () {
        var notes = [
            {
                id: 1,
                title: "CAS-FEE Projekt bearbeiten",
                content: "Hier ist ein Text welcher einen möglichen Inhalt einer Notiz darstellt. Dieser kann relative sehr gross sein. Die Idee ist dass durch einen Klick (derzeit Hover) der Inhalt sichtbar oder unsichtbar wird. Natürlich kann dieser Text sehr sehr lange werden und muss entsprechend in der kleinen Ansicht mit Ellipsis dargestellt werden.",
                finished: false,
                importance: 2,
                due: moment().add(1, 'days')
            },
            {
                id: 2,
                title: "Einkaufen",
                content: "- Butter\n- Bier\n- Eier\n- Brot",
                finished: true,
                importance: 4,
                due: moment().add(3, 'days')
            }
        ];

        var renderData = function () {
            var generatedHtml = Handlebars.getTemplate('notes-template')(notes);
            $('#notes-table').html(generatedHtml);
        };
        renderData();
    });

    Handlebars.getTemplate = function(name) {
        if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
            $.ajax({
                url : 'hbs/' + name + '.hbs',
                success : function(data) {
                    if (Handlebars.templates === undefined) {
                        Handlebars.templates = {};
                    }
                    Handlebars.templates[name] = Handlebars.compile(data);
                },
                async : false
            });
        }
        return Handlebars.templates[name];
    };

})(jQuery);

