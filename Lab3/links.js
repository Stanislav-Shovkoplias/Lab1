const uuid = require('uuid')

const Link = class {
  constructor(noteID) {
    this.id = uuid.v1();
    this.noteID = noteID;
  }

  getID() {
    return this.id
  }

  getNoteID() {
    return this.noteID;
  }

  setNoteID(noteID) {
    this.noteID = noteID;
  }
}

module.exports = Link;
