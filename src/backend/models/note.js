'use strict';

var moment = require('momentjs');

/**
 * Class Note.
 */
class Note {
    constructor(title, content, importance, finishedDate, dueDate) {
        this.title = "" + title;
        this.content = "" + content;
        this.importance = importance > 0 && importance <= 5 ? importance : 3;
        this.finishedDate = finishedDate ? moment(finishedDate).format('YYYY-MM-DD') : null;
        this.createdDate = moment().format('YYYY-MM-DD');
        this.isFinished = this.finishedDate !== null;
        this.dueDate = dueDate ? moment(dueDate).format('YYYY-MM-DD') : null;
    }
}

module.exports = Note;