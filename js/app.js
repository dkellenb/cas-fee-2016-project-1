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
        var notesTemplate = $('#notes-template').html();
        var compiledNotesTemplate = Handlebars.compile(notesTemplate);
        var renderData = function () {
            var generatedHtml = compiledNotesTemplate(notes);
            $('#notes-table').html(generatedHtml);
        };
        renderData();

        var modal = $('#note-modal');

        $('#create-note').on('click', function () {
            modal.show();
        });
        $('#modal-close').on('click', function() {
            modal.hide();
        });

        // When the user clicks anywhere outside of the modal, close it
        // TODO: register handler with jquery
        window.onclick = function(event) {
            if (event.target == modal.get(0)) {
                modal.hide();
            }
        };
    });
})(jQuery);
