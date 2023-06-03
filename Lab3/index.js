'use strict';

const express = require('express');
const url = require('url');
const fs = require('fs');
const uuid = require('uuid');
const db = require('./database/connection');
const NoteDB = require('./database/note');
const UserDB = require('./database/user');
const LinkDB = require('./database/link');
const TagDB = require('./database/tag');
const Note = require('./notes');
const User = require('./user');
const Link = require('./links');
const swaggerUi = require('swagger-ui-express');
const app = express();

const host = '0.0.0.0';
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))

var users = new UserDB(db.con);
var notes = new NoteDB(db.con);
var links = new LinkDB(db.con);
var tags = new TagDB(db.con);

function replacer(key, value) {
    if (value instanceof Map) {
        var elements = new Array()
        return value
    } else {
      return value;
    }
};

function increment(rcon, key) {
    rcon.get(key)
        .then((value) => {
            if (value === null) {
                value = 1;
            } else {
                value++;
            }
            rcon.set(key, value);
        })
};

const swaggerFile = JSON.parse(fs.readFileSync('./swagger-output.json'))
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.all("/api/v1", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({ status: "working" }));
    res.end();
});

// Users endpoints
app.get("/api/v1/user", (req, res) => {
    // #swagger.description = 'Get all users'
    /* #swagger.responses[200] = {
        description: 'Array of all users',
        schema: [{ $ref: '#/definitions/User' }]
    } */
    increment(db.rcon, "user")
    res.setHeader("Content-Type", "application/json");
    users.GetAll()
        .then((result) => {
            res.write(JSON.stringify(result));
            res.end();
        });
});
app.get("/api/v1/user/:userID", (req, res) => {
    // #swagger.description = 'Get user by id'
    // #swagger.parameters['userID'] = { description: 'User id' }
    /* #swagger.responses[200] = {
        description: 'User',
        schema: { $ref: '#/definitions/User' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'user not found' }
    } */
    increment(db.rcon, "user")
    res.setHeader("Content-Type", "application/json");
    var userID = req.params["userID"];

    users.GetByID(userID)
        .then((result) => {
            console.log(result);
            res.write(JSON.stringify( result ));
        })
        .catch(() => {
            res.statusCode = 404;
            res.write(JSON.stringify({ status: "error", error: "user not found" }));
        })
        .finally(() => res.end())

    // var user = users.get(userID);
    // if (typeof (user) === 'undefined') {
    //     res.statusCode = 404;
    //     res.write(JSON.stringify({ status: "error", error: "user not found" }));
    // } else {
    //     res.write(JSON.stringify( user ));
    // }
    // res.end();
});
app.post("/api/v1/user", (req, res) => {
    // #swagger.description = 'Add user'
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Add a user',
            schema: { $ref: '#/definitions/User_nid' }
    } */
    /* #swagger.responses[200] = {
        description: 'Created',
        schema: { status: 'success', user: { $ref: '#/definitions/User' } }
    } */
    /* #swagger.responses[403] = {
        description: 'User already exist',
        schema: { status: 'error', error: 'user already exist' }
    } */
    /* #swagger.responses[406] = {
        description: 'username error',
        schema: { status: 'error', error: 'username not supplied' }
    } */
    increment(db.rcon, "user")
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        if (body.length == 0) {
            res.statusCode = 404
            res.write(JSON.stringify({ status: "error", error: "request body not found" }))
            res.end();
        } else {
            var post = JSON.parse(body);
            var username = post["Name"]
            if (typeof (username) === 'undefined' || username.length === 0) {
                res.statusCode = 406
                res.write(JSON.stringify({ status: "error", error: "username not supplied" }))
                res.end();
            } else {
                users.GetByName(username)
                    .then((result) => {
                        res.statusCode = 403
                        res.write(JSON.stringify({ status: "error", error: "user already exist" }));
                    })
                    .catch(async () => {
                        await users.AddByName(username)
                            .then((result) => {
                                res.write(JSON.stringify({ status: "success", userID: result.insertId }));
                            })
                            .catch((error) => {
                                res.statusCode = 500
                                res.write(JSON.stringify({ status: "error", error: error }));
                            })
                    })
                    .finally(() => {
                        res.end();
                    })
            }
        }
    });
});
app.delete("/api/v1/user/:userID", (req, res) => {
    // #swagger.description = 'Delete user by id'
    // #swagger.parameters['userID'] = { description: 'User id' }
    /* #swagger.responses[200] = {
        description: 'Success',
        schema: { status: 'success' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'user not found' }
    } */
    increment(db.rcon, "user")
    res.setHeader("Content-Type", "application/json");
    var userID = req.params["userID"];

    users.GetByID(userID)
        .then(async () => {
            await users.DeleteByID(userID)
                .then(() => { 
                    res.write(JSON.stringify({ status: "success" }));
                })
                .catch((error) => {
                    res.statusCode = 500;
                    res.write(JSON.stringify({ status: "error", error: error }));
                })
        })
        .catch(() => {
            res.statusCode = 404;
            res.write(JSON.stringify({ status: "error", error: "user not found" }));
        })
        .finally(() => { 
            res.end();
        })
});
app.patch("/api/v1/user/:userID", (req, res) => {
    // #swagger.description = 'Edit user'
    // #swagger.parameters['userID'] = { description: 'User id' }
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'New name',
            schema: { $ref: '#/definitions/Note_nid' }
    } */
    /* #swagger.responses[403] = {
        description: 'User already exist',
        schema: { status: 'error', error: 'user already exist' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'user not found' }
    } */
    /* #swagger.responses[406] = {
        description: 'name error',
        schema: { status: 'error', error: 'name not supplied' }
    } */
    increment(db.rcon, "user")
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        var userID = req.params["userID"];

        users.GetByID(userID)
            .then(async () => {
                if (body.length == 0) {
                    res.statusCode = 404
                    res.write(JSON.stringify({ status: "error", error: "request body not found" }))
                    res.end();
                } else {
                    var post = JSON.parse(body);
                    var username = post["Name"]
                    if (typeof (username) === 'undefined' || username.length === 0) {
                        res.statusCode = 406
                        res.write(JSON.stringify({ status: "error", error: "username not supplied" }))
                    } else {
                        await users.GetByName(username)
                            .then(() => {
                                res.statusCode = 403
                                res.write(JSON.stringify({ status: "error", error: "user with such username already exist" }));
                            })
                            .catch(async () => {
                                await users.UpdateByID(userID, username)
                                    .then(() => {
                                        res.write(JSON.stringify({ status: "success" }));
                                    })
                                    .catch((error) => {
                                        res.statusCode = 500
                                        res.write(JSON.stringify({ status: "error", error: error }));
                                    })
                            })
                    }
                }
            })
            .catch(() => {
                res.statusCode = 404
                res.write(JSON.stringify({ status: "error", error: "user not found" }));
            })
            .finally(() => {
                res.end();
            })
    });
});

// Notes endpoints
app.get("/api/v1/note", (req, res) => {
    // #swagger.description = 'Get notes'
    /* #swagger.responses[200] = {
        description: 'Note',
        schema: [{ $ref: '#/definitions/Note' }]
    } */
    /* #swagger.parameters['page'] = {
            in: 'query',
            description: 'Numper of page',
            required: 'false'
    } */
    /* #swagger.parameters['items_per_page'] = {
            in: 'query',
            description: 'Items per page',
            required: 'false'
    } */
    increment(db.rcon, "note")
    res.setHeader("Content-Type", "application/json");
    var parsedUrl = url.parse(req.url, true); // true to get query as obj
    var page = parsedUrl.query['page'];
    var limit = parsedUrl.query["items_per_page"]

    notes.GetAll(page, limit)
        .then((result) => {
            res.write(JSON.stringify( result ));
        })
        .catch((err) => {
            console.log(err)
            res.write(JSON.stringify({ status: "error", error: err }));
        })
        .finally(() => {
            res.end();
        })
});
app.get("/api/v1/note/:noteID", (req, res) => {
    // #swagger.description = 'Get note by id'
    // #swagger.parameters['noteID'] = { description: 'Note id' }
    /* #swagger.responses[200] = {
        description: 'Note',
        schema: { $ref: '#/definitions/Note' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'note not found' }
    } */
    increment(db.rcon, "note")
    res.setHeader("Content-Type", "application/json");
    var noteID = req.params["noteID"];

    notes.GetByID(noteID)
        .then((result) => { 
            res.write(JSON.stringify( result ));
        })
        .catch(() => { 
            res.statusCode = 404;
            res.write(JSON.stringify({ status: "error", error: "note not found" }));
        })
        .finally(() => { 
            res.end();
        })
});
app.post("/api/v1/note", (req, res) => {
    // #swagger.description = 'Add note'
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Add a note',
            schema: { $ref: '#/definitions/Note_nid' }
    } */
    /* #swagger.responses[200] = {
        description: 'Created',
        schema: { status: 'success', note: { $ref: '#/definitions/Note' } }
    } */
    /* #swagger.responses[406] = {
        description: 'note error',
        schema: { status: 'error', error: 'noteID not supplied' }
    } */
    increment(db.rcon, "note")
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        if (body.length == 0) {
            res.statusCode = 404
            res.write(JSON.stringify({ status: "error", error: "request body not found" }))
            res.end();
        } else {
            var post = JSON.parse(body);
            var title = post["Title"];
            var noteData = post["Content"];
            var userID = post["UserID"];
            var tag = post["Tag"];
            if (typeof (userID) === 'undefined' || userID.length === 0) {
                res.statusCode = 406
                res.write(JSON.stringify({ status: "error", error: "userID not found" }))
                res.end();
            } else {
                users.GetByID(userID)
                    .then(async () => {
                        await notes.Add(title, noteData, userID, tag)
                            .then((result) => {
                                res.write(JSON.stringify({ status: "success", noteID: result.insertId }));
                            })
                            .catch((err) => {
                                res.statusCode = 500
                                res.write(JSON.stringify({ status: "error", error: err }));
                            })
                    
                    })
                    .catch(() => {
                        res.statusCode = 404;
                        res.write(JSON.stringify({ status: "error", error: "user not found" }));
                    })
                    .finally(() => {
                        res.end();
                    })
            }
        }
    });
});
app.delete("/api/v1/note/:noteID", (req, res) => {
    // #swagger.description = 'Delete note by id'
    // #swagger.parameters['noteID'] = { description: 'Note id' }
    /* #swagger.responses[200] = {
        description: 'Success',
        schema: { status: 'success' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'note not found' }
    } */
    increment(db.rcon, "note")
    res.setHeader("Content-Type", "application/json");
    var noteID = req.params["noteID"];

    notes.DeleteByID(noteID)
        .then(() => {
            res.write(JSON.stringify({ status: "success" }));
        })
        .catch(() => { 
            res.statusCode = 404;
            res.write(JSON.stringify({ status: "error", error: "note not found" }));
        })
        .finally(() => { 
            res.end();
        })
});
app.patch("/api/v1/note/:noteID", (req, res) => {
    // #swagger.description = 'Patch note by id'
    // #swagger.parameters['noteID'] = { description: 'Note id' }
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'New data',
            schema: {  title: 'Title', note: 'Content' }
    } */
    /* #swagger.responses[200] = {
        description: 'Created',
        schema: { status: 'success', note: { $ref: '#/definitions/Note' } }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'note not found' }
    } */
    increment(db.rcon, "note")
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        var noteID = req.params["noteID"];

        notes.GetByID(noteID)
            .then(async () => { 
                if (body.length == 0) {
                    res.statusCode = 404
                    res.write(JSON.stringify({ status: "error", error: "request body not found" }))
                    res.end();
                } else {
                    var post = JSON.parse(body);
                    var title = post["Title"];
                    var data = post["Content"];
                    var tag = post["Tag"];
                    await notes.UpdateByID(noteID, title, data, tag)
                        .then(() => {
                            res.write(JSON.stringify({ status: "success" }));
                        })
                        .catch((err) => {
                            res.statusCode = 500
                            res.write(JSON.stringify({ status: "error", error: err }));
                        })
                }
            })
            .catch(() => {
                res.statusCode = 404
                res.write(JSON.stringify({ status: "error", error: "note not found" }));
            })
            .finally(() => { 
                res.end();
            })
    });

});
app.get("/api/v1/note/:noteID/tag", (req, res) => {
    // #swagger.description = 'Get all tags for note'
    // #swagger.parameters['noteID'] = { description: 'Note id' }
    /* #swagger.responses[200] = {
        description: 'Array of all tags for node',
        schema: [{ $ref: '#/definitions/Tag' }]
    } */
    increment(db.rcon, "note")
    res.setHeader("Content-Type", "application/json");
    var noteID = req.params["noteID"];

    notes.GetByID(noteID)
        .then(async () => { 
            await tags.GetByNoteID(noteID)
                .then((result) => { 
                    res.write(JSON.stringify(result))
                })
                .catch(() => { 
                    res.statusCode = 404
                    res.write(JSON.stringify({ status: "error", error: "tags not found" }))
                })
        })
        .catch(() => {
            res.write(JSON.stringify({status: "error", error: "note not found"}))
        })
        .finally(() => { 
            res.end();
        })

});
app.delete("/api/v1/note/:noteID/tag/:tagID", (req, res) => {
    // #swagger.description = 'Delete tag from note by id '
    // #swagger.parameters['noteID'] = { description: 'Note id' }
    // #swagger.parameters['tagID'] = { description: 'Tag id' }
    /* #swagger.responses[200] = {
        description: 'Success',
        schema: { status: 'success' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'connection not found' }
    } */
    increment(db.rcon, "note")
    res.setHeader("Content-Type", "application/json");
    var noteID = req.params["noteID"];
    var tagID = req.params["tagID"];

    tags.DeleteFromNote(tagID, noteID)
        .then(() => {
            res.write(JSON.stringify({ status: "success" }));
        })
        .catch(() => { 
            res.statusCode = 404;
            res.write(JSON.stringify({ status: "error", error: "connection not found" }));
        })
        .finally(() => { 
            res.end();
        })
})
app.post("/api/v1/note/:noteID/tag", (req, res) => { 
    // #swagger.description = 'Add tag to note'
    // #swagger.parameters['noteID'] = { description: 'Note id' }
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Add a tag',
            schema: { TagID: 0 }
    } */
    /* #swagger.responses[200] = {
        description: 'Created',
        schema: { status: 'success', tag: { $ref: '#/definitions/Tag' } }
    } */
    /* #swagger.responses[403] = {
        description: 'Tag already exist',
        schema: { status: 'error', error: 'tag already exist' }
    } */
    /* #swagger.responses[406] = {
        description: 'name error',
        schema: { status: 'error', error: 'request body not found' }
    } */
    increment(db.rcon, "note");
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        if (body.length == 0) {
            res.statusCode = 404
            res.write(JSON.stringify({ status: "error", error: "request body not found" }))
            res.end();
        } else {
            var post = JSON.parse(body);
            var tagID = post["TagID"];
            var noteID = parseInt(req.params["noteID"]);
            
            tags.AddConnection(tagID, noteID)
                .then(() => { 
                    res.write(JSON.stringify({status: "success"}))
                })
                .catch((err) => {
                    res.statusCode = 500
                    res.write(JSON.stringify({status: "error", error: err}))
                })
                .finally(() => res.end())
        }
    })

})


// Tags endpoints
app.get("/api/v1/tag", (req, res) => {
    // #swagger.description = 'Get all tags'
    /* #swagger.responses[200] = {
        description: 'Array of all tags',
        schema: [{ $ref: '#/definitions/Tag' }]
    } */
    increment(db.rcon, "tag");
    res.setHeader("Content-Type", "application/json");

    tags.GetAll()
        .then((result) => {
            res.write(JSON.stringify( result ));
        })
        .catch((err) => {
            console.log(err)
            res.write(JSON.stringify({ status: "error", error: err }));
        })
        .finally(() => {
            res.end();
        })
});
app.get("/api/v1/tag/:tagID", (req, res) => {
    // #swagger.description = 'Get user by id'
    // #swagger.parameters['tagID'] = { description: 'Tag id' }
    /* #swagger.responses[200] = {
        description: 'Tag',
        schema: { $ref: '#/definitions/Tag' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'tag not found' }
    } */
    increment(db.rcon, "tag");
    res.setHeader("Content-Type", "application/json");
    var tagID = req.params["tagID"];

    tags.GetByID(tagID)
        .then((result) => { 
            res.write(JSON.stringify( result ));
        })
        .catch(() => { 
            res.statusCode = 404;
            res.write(JSON.stringify({ status: "error", error: "tag not found" }));
        })
        .finally(() => { 
            res.end();
        })
});
app.post("/api/v1/tag", (req, res) => {
    // #swagger.description = 'Add tag'
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Add a tag',
            schema: { $ref: '#/definitions/Tag_nid' }
    } */
    /* #swagger.responses[200] = {
        description: 'Created',
        schema: { status: 'success', tag: { $ref: '#/definitions/Tag' } }
    } */
    /* #swagger.responses[403] = {
        description: 'Tag already exist',
        schema: { status: 'error', error: 'tag already exist' }
    } */
    /* #swagger.responses[406] = {
        description: 'name error',
        schema: { status: 'error', error: 'request body not found' }
    } */
    increment(db.rcon, "tag");
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        if (body.length == 0) {
            res.statusCode = 404
            res.write(JSON.stringify({ status: "error", error: "request body not found" }))
            res.end();
        } else {
            var post = JSON.parse(body);
            var name = post["Name"];
            if (typeof (name) === 'undefined' || name.length === 0) {
                res.statusCode = 406
                res.write(JSON.stringify({ status: "error", error: "name not found" }))
                res.end();
            } else {
                tags.GetByName(name)
                    .then(() => {
                        res.write(JSON.stringify({ status: "error", error: "tag already exist" }))
                    })
                    .catch(async () => {
                        await tags.Add(name)
                            .then((result) => {
                                console.log("trigger")
                                res.write(JSON.stringify({ status: "success", tagID: result.insertId }))
                            })
                            .catch((err) => {
                                res.statusCode = 500
                                res.write(JSON.stringify({ status: "error", error: err }))
                            })
                    })
                    .finally(() => {
                        res.end();
                    })
            }
        }
    });
});
app.delete("/api/v1/tag/:tagID", (req, res) => { 
    // #swagger.description = 'Delete tag by id'
    // #swagger.parameters['tagID'] = { description: 'Tag id' }
    /* #swagger.responses[200] = {
        description: 'Success',
        schema: { status: 'success' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'tag not found' }
    } */
    increment(db.rcon, "tag");
    res.setHeader("Content-Type", "application/json");
    var tagID = req.params["tagID"];

    tags.DeleteByID(tagID)
        .then(() => {
            res.write(JSON.stringify({ status: "success" }));
        })
        .catch(() => { 
            res.statusCode = 404;
            res.write(JSON.stringify({ status: "error", error: "tag not found" }));
        })
        .finally(() => { 
            res.end();
        })
})
app.patch("/api/v1/tag/:tagID", (req, res) => {
    // #swagger.description = 'Patch tag by id'
    // #swagger.parameters['tagID'] = { description: 'Tag id' }
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'New data',
            schema: {  $ref: '#/definitions/Tag_nid' }
    } */
    /* #swagger.responses[200] = {
        description: 'Created',
        schema: { status: 'success', note: { $ref: '#/definitions/Tag' } }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'tag not found' }
    } */
    increment(db.rcon, "tag");
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        var tagID = req.params["tagID"];

        tags.GetByID(tagID)
            .then(async () => { 
                if (body.length == 0) {
                    res.statusCode = 404
                    res.write(JSON.stringify({ status: "error", error: "request body not found" }))
                    res.end();
                } else {
                    var post = JSON.parse(body);
                    var name = post["Name"];
                    await tags.GetByName(name)
                        .then(() => { 
                            res.write(JSON.stringify({status: "error", error: "tag name already exist"}))
                        })
                        .catch(async () => { 
                            await tags.UpdateByID(tagID, name)
                                .then(() => {
                                    res.write(JSON.stringify({ status: "success" }));
                                })
                                .catch((err) => {
                                    res.statusCode = 500
                                    res.write(JSON.stringify({ status: "error", error: err }));
                                })
                        })
                }
            })
            .catch(() => {
                res.statusCode = 404
                res.write(JSON.stringify({ status: "error", error: "tag not found" }));
            })
            .finally(() => { 
                res.end();
            })
    });

})

// Links endpoints
app.get("/api/v1/link/:linkID", (req, res) => {
    // #swagger.description = 'Get link by id'
    // #swagger.parameters['linkID'] = { description: 'Link id' }
    /* #swagger.responses[200] = {
        description: 'Link',
        schema: { $ref: '#/definitions/Link' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'link not found' }
    } */
    increment(db.rcon, "link");
    res.setHeader("Content-Type", "application/json");
    var linkID = req.params["linkID"];

    links.GetByID(linkID)
        .then((result) => { 
            res.write(JSON.stringify( result ));
        })
        .catch(() => { 
            res.statusCode = 404;
            res.write(JSON.stringify({ status: "error", error: "link not found" }));
        })
        .finally(() => {
            res.end();
        })
});
app.post("/api/v1/link", (req, res) => {
    // #swagger.description = 'Add link'
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Note id',
            schema: { $ref: '#/definitions/Link_nid' }
    } */
    /* #swagger.responses[200] = {
        description: 'Created',
        schema: { status: 'success', link: { $ref: '#/definitions/Link' } }
    } */
    /* #swagger.responses[406] = {
        description: 'noteID error',
        schema: { status: 'error', error: 'noteID not supplied' }
    } */
    increment(db.rcon, "link");
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        if (body.length == 0) {
            res.statusCode = 404
            res.write(JSON.stringify({ status: "error", error: "request body not found" }))
            res.end();
        } else {
            var post = JSON.parse(body);
            var noteID = post["NoteID"];


            notes.GetByID(noteID)
                .then(async () => {
                    await links.Add(noteID)
                        .then((result) => {
                            res.write(JSON.stringify({ status: "success", linkID: result.insertId }));
                        })
                        .catch((err) => {
                            res.statusCode = 500
                            res.write(JSON.stringify({ status: "error", error: err }));
                        })
                })
                .catch(() => {
                    res.statusCode = 406
                    res.write(JSON.stringify({ status: "error", error: "note not found" }))
                })
                .finally(() => {
                    res.end();
                })
        }
    });

});
app.delete("/api/v1/link/:linkID", (req, res) => {
    // #swagger.description = 'Delete link by id'
    // #swagger.parameters['linkID'] = { description: 'Link id' }
    /* #swagger.responses[200] = {
        description: 'Success',
        schema: { status: 'success' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'link not found' }
    } */
    increment(db.rcon, "link");
    res.setHeader("Content-Type", "application/json");
    var linkID = req.params["linkID"];

    links.DeleteByID(linkID)
        .then(() => { 
            res.write(JSON.stringify({ status: "success" }));
        })
        .catch((err) => { 
            res.statusCode = 404;
            res.write(JSON.stringify({ status: "error", error: "link not found" }));
        })
        .finally(() => { 
            res.end();
        })
});
app.patch("/api/v1/link/:linkID", (req, res) => {
    // #swagger.description = 'Patch link by id'
    // #swagger.parameters['linkID'] = { description: 'link id' }
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'New data',
            schema: { $ref: '#/definitions/Link_nid' }
    } */
    /* #swagger.responses[200] = {
        description: 'Created',
        schema: { status: 'success', link: { $ref: '#/definitions/Link' } }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'link not found' }
    } */
    increment(db.rcon, "link");
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        var linkID = req.params["linkID"];
        links.GetByID(linkID)
            .then(async () => {
                if (body.length == 0) {
                    res.statusCode = 404
                    res.write(JSON.stringify({ status: "error", error: "request body not found" }))
                    res.end();
                } else {
                    var post = JSON.parse(body);
                    var noteID = post["NoteID"];
                    if (typeof (noteID) === 'undefined' || noteID.length === 0) {
                        res.statusCode = 406
                        res.write(JSON.stringify({ status: "error", error: "noteID not supplied" }))
                    } else {
                        await notes.GetByID(noteID)
                            .then(async () => {
                                await links.UpdateByID(linkID, noteID)
                                    .then(() => {
                                        res.write(JSON.stringify({ status: "success" }));
                                    })
                                    .catch((err) => {
                                        res.statusCode = 500
                                        res.write(JSON.stringify({ status: "error", error: err }));
                                    })

                            })
                            .catch((err) => {
                                res.statusCode = 500
                                res.write(JSON.stringify({ status: "error", error: err }));
                            })
                    }
                }
            })
            .catch(() => { 
                res.statusCode = 404
                res.write(JSON.stringify({ status: "error", error: "link not found" }));
            })
            .finally(() => res.end());
    });
});

// Redis statistics
app.get("/api/v1/statistics", async (req, res) => { 
    // #swagger.description = 'Get API statistics'
    /* #swagger.responses[200] = {
        description: 'Statistics by APIs',
        schema: [{endpoint: "user", count: 1 }]
    } */
    res.setHeader("Content-Type", "application/json");
    var values = new Map()
    var keys = ["user", "note", "link", "tag"]
    for (const i in keys) {
        var key = keys[i]
        await db.rcon.get(key)
            .then((value) => {
                values.set(key, value);
            });
    }
    res.write(JSON.stringify(
        [...values].map((element) => {
            return {
                "endpoint": element[0],
                "count": parseInt(element[1])
            }
        })
    ))
    res.end();
})

app.all('/', (req, res) => {
    var key = req.body['key']
    res.render('pages/index', {
        notes,
        key,
        title: "Home Page"
    });
});

app.get('/new', (req, res) => {
    var parsedUrl = url.parse(req.url, true); // true to get query as obj
    var key = parsedUrl.query['key'];
    res.render('pages/new_note', {
        title: "New note",
        key
    });
});

app.post('/new', (req, res) => {
    var key = req.body['key'];
    if (notes.get(key) === undefined) {
        notes.set(key, new Array());
    }
    notes.get(key).push(new Note(req.body['title'], req.body['data']));

    res.render('pages/index', {
        notes,
        key,
        title: "Successfull"
    });
})

app.get('/edit', (req, res) => {
    var parsedUrl = url.parse(req.url, true); // true to get query as obj
    var id = parsedUrl.query['id'];
    var key = parsedUrl.query['key'];
    res.render('pages/edit', {
        title: "Edit note",
        notes, // for verification
        key,
        id
    });
});


app.post('/edit', (req, res) => {
    var id = req.body['id'];
    var key = req.body['key'];

    if (typeof (key) === 'undefined' || typeof (notes.get(key)) === 'undefined') {
        res.render('pages/message', {
            title: "Error",
            message: `Key not found`,
        });
    } else if (typeof (id) === 'undefined') {
        res.render('pages/message', {
            title: "Error",
            message: `Note identificator not found`,
        });
    } else {
        var links = notes.get(key);
        links.forEach(element => {
            if (element.getId() === id) {
                element.setNoteTitle(req.body['title']);
                element.setNote(req.body['data']);
            }
        });
    }

    res.render('pages/index', {
        notes,
        key,
        title: "Successfull"
    });
});

app.post('/delete', (req, res) => {
    var id = req.body['id'];
    var key = req.body['key'];

    if (typeof (key) === 'undefined' || typeof (notes.get(key)) === 'undefined') {
        res.render('pages/message', {
            title: "Error",
            message: `Key not found`,
        });
    } else if (typeof (id) === 'undefined') {
        res.render('pages/message', {
            title: "Error",
            message: `Note identificator not found`,
        });
    } else {
        var links = notes.get(key);
        links.forEach(element => {
            if (element.getId() === id) {
                notes.get(key).splice(links.indexOf(element), 1);
            }
        });
        res.render('pages/index', {
            notes,
            key,
            title: "Successfull"
        });
    }
});


app.post('/viewport', (req, res) => {
    var id = req.body['id'];
    var key = req.body['key'];

    if (typeof (key) === 'undefined' || typeof (notes.get(key)) === 'undefined') {
        res.render('pages/message', {
            title: "Error",
            message: `Key not found`,
        });
    } else {
        var note = notes.get(key).filter(el => el.getId() === id)[0];
        if (typeof (id) === 'undefined') {
            res.render('pages/message', {
                title: "Error",
                message: `Note identificator not found`,
            });
        } else if (typeof (note.getPublicId()) !== 'undefined') {
            res.render('pages/message', {
                title: "Error",
                message: `Note already have public URL`,
            });
        } else {
            var notePublicId = uuid.v1();

            viewNotes.set(notePublicId, { id: id, key: key })

            note.setPublicId(notePublicId);

            res.render('pages/message', {
                title: "Success",
                message: `Your message link:`,
                content: `<a href="/viewport?id=${notePublicId}">Link</a>`,
                escape: false
            });
        }
    }
});

app.get('/viewport', (req, res) => {
    var parsedUrl = url.parse(req.url, true); // true to get query as obj
    var id = parsedUrl.query['id'];
    var realId = viewNotes.get(id)['id']
    var key = viewNotes.get(id)['key']
    res.render('pages/message', {
        title: "Message",
        message: `${notes.get(key).filter(el => el.getId() === realId)[0].getNoteTitle()}`,
        content: `${notes.get(key).filter(el => el.getId() === realId)[0].getNote()}`,
        escape: true
    });
});

app.listen(port, host, () => {
    console.log(`App listening at http://${host}:${port}/`);
})
