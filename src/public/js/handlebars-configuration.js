/**
 * Goal: Configure handlebars for the needs of the application.
 */

(function (Handlebars, $, namespace) {

    //Enum with template names
    const TemplatesNames = {
        NOTE_TEMPLATE_NAME: 'note-template',
        NOTES_TEMPLATE_NAME: 'notes-template',
        WHITE_SPACE_TEMPLATE :'white-space-tempalte'
    };

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

    Handlebars.registerPartial('noteTemplate', Handlebars.getTemplate(TemplatesNames.NOTE_TEMPLATE_NAME));

    namespace.hbsTemplates = TemplatesNames;

})(Handlebars, jQuery, window.notesnamespace);
