const User = require('./user');

const API = class {
    constructor() {};
  
    init(app) {
    app.all("/api/v1", (req,res) => {
        res.write(JSON.stringify({status: "working"}));
        res.end();
    });
    app.get("/api/v1/user/:userID", (req, res) => {
        var userID = req.params["userID"]
        res.write(JSON.stringify({username: users[userID].getUserName()}))
        res.end();
    });

    app.post("/api/v1/user", (req, res) => {
        var body = JSON.parse(req.body)
        var username = body["username"]
        if (users.get(userID) === undefined) {
            var user = new User(username);
            users.set(userID, new User());
            res.write(JSON.stringify({status: "success"}));
        } else {
            res.write(JSON.stringify({status: "error", error: "user already exist"}));
        }
        res.end();
    });
    app.delete("/api/v1/user/:userID", (req, res) => {
                
    });
    app.patch("/api/v1/user/:userID", (req, res) => {
                
    });
    app.get("/api/v1/note/:noteID", (req, res) => {
        
    });
    app.post("/api/v1/note", (req, res) => {
                
    });
    app.delete("/api/v1/note/:noteID", (req, res) => {
                
    });
    app.patch("/api/v1/note/:noteID", (req, res) => {
                
    });
    app.get("/api/v1/link/:linkID", (req, res) => {
        
    });
    app.post("/api/v1/link", (req, res) => {
                
    });
    app.delete("/api/v1/link/:linkID", (req, res) => {
                
    });
    app.patch("/api/v1/link/:linkID", (req, res) => {
                
    });
 }
}
module.exports = API