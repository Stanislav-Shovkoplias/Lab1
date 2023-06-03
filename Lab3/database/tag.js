var TagDB = class {
    constructor(con) {
        this.con = con;
    };

    GetAll() {
        return new Promise((resolve, reject) => {
            this.con.query("select * FROM Tag", (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    GetByID(tagID) {
        return new Promise((resolve, reject) => {
            this.con.query("select * FROM Tag WHERE ID = ?", [tagID], (err, result) => {
                if (err) reject(err);
                if (result.length == 0) {
                    reject("user not found")
                }
                resolve(result)
            });
        });
    }

    GetByName(tag) {
        return new Promise((resolve, reject) => {
            this.con.query("select * FROM Tag WHERE Name = ?", [tag], (err, result) => {
                if (err) reject(err);
                if (result.length == 0) {
                    reject("tag not found")
                }
                resolve(result)
            });
        });
    }


    GetByNoteID(noteID) {
        return new Promise((resolve, reject) => {
            this.con.query("select t.* from Tag t join TagNote on TagID = ID where NoteID = ?", [noteID], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    Add(name) {
        return new Promise((resolve, reject) => { 
            this.con.query("insert into Tag value (default, ?)", [name], (err, result) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }

    DeleteByID(tagID) {
        return new Promise((resolve, reject) => {
            this.con.query("delete from Tag where ID = ?", [tagID], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    DeleteFromNote(tagID, noteID) {
        return new Promise((resolve, reject) => {
            this.con.query("delete from TagNote where NoteID = ? and TagID = ?", [noteID, tagID], (err, result) => {
                if (err) reject(err);
                if (result.affectedRows == 0) reject("connection not found")
                resolve(result)
            });
        });
    }

    UpdateByID(tagID, name) {
        return new Promise((resolve, reject) => {
            this.con.query("update Tag set Name = ? where ID = ?", [name, tagID], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    AddConnection(tagID, noteID) {
        return new Promise((resolve, reject) => {
            this.con.query("insert into TagNote value (?, ?)", [tagID, noteID], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }
};

module.exports = TagDB;