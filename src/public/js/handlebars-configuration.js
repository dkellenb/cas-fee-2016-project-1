/**
 * Goal: Configure handlebars for the needs of the application.
 */

(function (Handlebars, $, namespace) {
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

    Handlebars.registerPartial('noteTemplate', Handlebars.getTemplate('note-template'));

    //register template names in namespace for rendering.
    namespace.hbsTemplates = {
        NOTE_TEMPLATE_NAME: 'note-template',
        NOTES_TEMPLATE_NAME: 'notes-template'
    }

})(Handlebars, jQuery, window.notesnamespace);
