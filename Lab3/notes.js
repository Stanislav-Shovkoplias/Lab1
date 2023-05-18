const uuid = require('uuid')

const Note = class {
  constructor(title, note) {
    this.title = title;
    this.note = note;

    this.id = uuid.v1();
  }

  getNoteTitle() {
    return this.title;
  }

  setNoteTitle(title) {
    this.title = title;
  }

  getNote() {
    return this.note;
  }

  setNote(note) {
    this.note = note;
  }

  getId() {
    return this.id;
  }

  setPublicId(id) {
    this.publicId = id;
  }

  getPublicId() {
    return this.publicId;
  }
}

module.exports = Note;
