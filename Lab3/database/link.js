var LinkDB = class {
    constructor(con) {
        this.con = con;
    };

    GetAll() {
        return new Promise((resolve, reject) => {
            this.con.query("select * FROM Link", (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    GetByID(linkID) {
        return new Promise((resolve, reject) => {
            this.con.query("select * FROM Link WHERE ID = ?", [linkID], (err, result) => {
                if (err) reject(err);
                if (result.length == 0) {
                    reject("link not found")
                }
                resolve(result)
            });
        });
    }

    Add(noteID) {
        return new Promise((resolve, reject) => {
            this.con.query("insert into Link values (default, ?)", [noteID], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    DeleteByID(linkID) {
        return new Promise((resolve, reject) => {
            this.con.query("delete from Link where ID = ?", [linkID], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    UpdateByID(linkID, noteID) {
        return new Promise((resolve, reject) => {
            this.con.query("update Link set NoteID = ? where ID = ?", [noteID, linkID], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

};

module.exports = LinkDB;