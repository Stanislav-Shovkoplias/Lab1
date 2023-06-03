var NoteDB = class {
    constructor(con) {
        this.con = con;
    };

    GetAll(page, limit) {
        return new Promise((resolve, reject) => {
            if (typeof (page) === 'undefined' || typeof (limit) === 'undefined') {
                this.con.query("select distinct n.*, t.Name as Tag FROM Note n left join TagNote tn on tn.NoteID = n.ID left join Tag t on t.ID = tn.TagID", (err, result) => {
                    if (err) reject(err);
                    resolve(result)
                });
            } else {
                var start = (page - 1)*limit;
                limit = limit * 1; // Convert to number, literally
                this.con.query("select distinct n.*, t.Name as Tag FROM Note n left join TagNote tn on tn.NoteID = n.ID left join Tag t on t.ID = tn.TagID LIMIT ?,?", [start, limit], (err, result) => {
                    if (err) reject(err);
                    resolve(result)
                });
            }
        });
    }

    GetByID(noteID) {
        return new Promise((resolve, reject) => {
            this.con.query("select distinct n.*, t.Name as Tag FROM Note n left join TagNote tn on tn.NoteID = n.ID left join Tag t on t.ID = tn.TagID WHERE n.ID = ?", [noteID], (err, result) => {
                if (err) reject(err);
                if (result.length == 0) {
                    reject("note not found")
                }
                resolve(result)
            });
        });
    }

    Add(title, data, userID, tag) {
        return new Promise((resolve, reject) => {
            this.con.query("insert into Note values (default, ?, ?, ?)", [title, data, userID], (err, result) => {
                if (err) reject(err);
                var noteID = result.insertId;
                if (typeof(tag) === 'undefined') {
                    this.con.query("insert into TagNote value (1,?)", [result.insertId], (err) => {
                        if (err) reject(err)
                    })
                } else {
                    this.con.query("select * from Tag where Name = ?", [tag], (err, result) => {
                        if (err) reject(err);
                        var tagID = 0;
                        if (result.length === 0) {
                            this.con.query("insert into Tag value(default, ?)", [tag], (err, result) => {
                                if (err) reject(err);
                                tagID = result.insertId;
                                this.con.query("insert into TagNote value (?,?)", [tagID, noteID], (err) => {
                                    if (err) reject(err)
                                })
                            });
                        } else {
                            tagID = result[0].ID;
                            this.con.query("insert into TagNote value (?,?)", [tagID, noteID], (err) => {
                                if (err) reject(err)
                            })
                        }
                    })
                }
                resolve(result)
            });
        });
    }

    DeleteByID(noteID) {
        return new Promise((resolve, reject) => {
            this.con.query("delete from Note where ID = ?", [noteID], (err, result) => {
                if (err) reject(err);
                if (result.affectedRows == 0) {
                    reject("note not found")
                }
                resolve(result)
            });
        });
    }

    UpdateByID(noteID, title, data, tag) {
        return new Promise((resolve, reject) => {
            this.con.query("update Note set Title = ?, Content = ? where ID = ?", [title, data, noteID], (err, result) => {
                if (err) reject(err);
                if (typeof(tag) !== 'undefined') {
                    this.con.query("select * from Tag where Name = ?", [tag], (err, result) => {
                        if (err) reject(err);
                        var tagID = 0;
                        if (result.length === 0) {
                            this.con.query("insert into Tag value(default, ?)", [tag], (err, result) => {
                                if (err) reject(err);
                                tagID = result.insertId;
                                this.con.query("update TagNote set TagID = ? where NoteID = ?", [tagID, noteID], (err) => {
                                    if (err) reject(err)
                                })
                            });
                        } else {
                            tagID = result[0].ID;
                            this.con.query("update TagNote set TagID = ? where NoteID = ?", [tagID, noteID], (err) => {
                                if (err) reject(err)
                            })
                        }
                    })
                }
                resolve(result)
            });
        });
    }

};

module.exports = NoteDB;