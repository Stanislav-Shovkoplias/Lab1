const uuid = require('uuid');

const User = class {
  constructor(username) {
    this.userID = uuid.v1()
    this.username = username;
  }

  getUserName() {
    return this.username;
  }

  setUserName(username) {
    this.username = username;
  }

  getUserID() {
    return this.userID
  }

  setUserID(userID) {
    this.userID = userID
  }
}

module.exports = User;
