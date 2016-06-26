'use strict';

var moment = require('moment');

/**
 * Class Note.
 */
class Note {
    constructor(title, content, importance, finishedDate, dueDate) {
        console.log(dueDate);
        this.title = "" + title;
        this.content = "" + content;
        this.importance = importance > 0 && importance <= 5 ? importance : 3;
        this.finishedDate = finishedDate ? moment(finishedDate).toDate() : null;
        this.createdDate = moment().toDate();
        this.isFinished = this.finishedDate !== null;
        this.dueDate = dueDate ? moment(dueDate).toDate() : null;
    }
}

module.exports = Note;