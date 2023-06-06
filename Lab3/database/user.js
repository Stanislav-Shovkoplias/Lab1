var UserDB = class {
    constructor(con) {
        this.con = con;
    };

    GetAll() {
        return new Promise((resolve, reject) => {
            this.con.query("select * FROM Users", (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    GetByID(userID) {
        return new Promise((resolve, reject) => {
            this.con.query("select * FROM Users WHERE ID = ?", [userID], (err, result) => {
                if (err) reject(err);
                if (result.length == 0) {
                    reject("user not found")
                }
                resolve(result)
            });
        });
    }

    GetByName(username) {
        return new Promise((resolve, reject) => {
            this.con.query("select * FROM Users WHERE Name = ?", [username], (err, result) => {
                if (err) reject(err);
                if (result.length == 0) {
                    reject("user not found")
                }
                resolve(result)
            });
        });
    }

    AddByName(username) {
        return new Promise((resolve, reject) => {
            this.con.query("insert into Users values (default, ?)", [username], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    DeleteByID(userID) {
        return new Promise((resolve, reject) => {
            this.con.query("delete from Users where ID = ?", [userID], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    DeleteByName(username) {
        return new Promise((resolve, reject) => {
            this.con.query("delete from Users where Name = ?", [username], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

    UpdateByID(userID, username) {
        return new Promise((resolve, reject) => {
            this.con.query("update Users set Name = ? where ID = ?", [username, userID], (err, result) => {
                if (err) reject(err);
                resolve(result)
            });
        });
    }

};

module.exports = UserDB;