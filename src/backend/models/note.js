'use strict';

var moment = require('moment');

/**
 * Note domain model.
 */
class Note {
    constructor(title, content, importance, finishedDate, dueDate) {
        this.title = "" + title;
        this.content = "" + content;
        this.importance = importance > 0 && importance <= 5 ? importance : 3;
        this.finishedDate = finishedDate ? moment.utc(finishedDate).toDate() : null;
        this.createdDate = moment().toDate();
        this.isFinished = this.finishedDate !== null;
        this.dueDate = dueDate ? moment.utc(dueDate).toDate() : null;
    }
}

module.exports = Note;