'use strict';

/**
 * Class Note.
 */
class Note {
    constructor(title, content, importance, finishedDate, dueDate) {
        this.title = "" + title;
        this.content = "" + content;
        this.importance = importance > 0 && importance <= 5 ? importance : 3;
        this.finished = finished === true;
        this.finishedDate = finishedDate !== null ? moment(finishedDate).format('YYYY-MM-DD') : null;
        this.isFinished = this.finished != null;
        this.dueDate = dueDate !== null ? moment(dueDate).format('YYYY-MM-DD') : null;
    }
}

module.exports = Note;