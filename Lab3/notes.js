const uuid = require('uuid')

const Note = class {
  constructor(title, note, user_id) {
    this.title = title;
    this.note = note;

    this.id = uuid.v1();
    this.userID = user_id;
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

  getID() {
    return this.id;
  }

  setPublicId(id) {
    this.publicId = id;
  }

  getPublicId() {
    return this.publicId;
  }

  getUserID() {
    return this.userID
  }

  setUserID(user_id) {
    this.userID = user_id
  }
}

module.exports = Note;
