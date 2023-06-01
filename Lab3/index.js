'use strict';

const express = require('express');
const url = require('url');
const fs = require('fs');
const uuid = require('uuid');
const Note = require('./notes');
const User = require('./user');
const Link = require('./links');
// const API = require('./api');
const swaggerUi = require('swagger-ui-express');
const app = express();

const host = '0.0.0.0';
const port = 3000;
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))

var users = new Map();
var notes = new Map();
var links = new Map();

function replacer(key, value) {
    if(value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else {
      return value;
    }
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
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(users, replacer));
    res.end();
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
    res.setHeader("Content-Type", "application/json");
    var userID = req.params["userID"];
    var user = users.get(userID);
    if (typeof (user) === 'undefined') {
        res.statusCode = 404;
        res.write(JSON.stringify({ status: "error", error: "user not found" }));
    } else {
        res.write(JSON.stringify( user ));
    }
    res.end();
});
app.post("/api/v1/user", (req, res) => {
    // #swagger.description = 'Add user'
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Add a user',
            schema: { username: 'Joe' }
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
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        var post = JSON.parse(body);
        var username = post["username"]
        if (typeof(username) === 'undefined' || username.length === 0) {
            res.statusCode = 406
            res.write(JSON.stringify({status: "error", error: "username not supplied"}))
        } else {
            var userExist = false
            users.forEach(element => {
                if (element.getUserName() === username) {
                    userExist = true
                }
            });

            if (userExist === false) {
                var user = new User(username);
                users.set(user.getUserID(), user);
                res.write(JSON.stringify({ status: "success", user: user }));
            } else {
                res.statusCode = 403
                res.write(JSON.stringify({ status: "error", error: "user already exist" }));
            }
        }
        res.end();
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
    res.setHeader("Content-Type", "application/json");
    var userID = req.params["userID"];
    var user = users.get(userID);
    if (typeof (user) === 'undefined') {
        res.statusCode = 404;
        res.write(JSON.stringify({ status: "error", error: "user not found" }));
    } else {
        users.delete(userID);
        res.write(JSON.stringify({ status: "success" }));
    }
    res.end();
});
app.patch("/api/v1/user/:userID", (req, res) => {
    // #swagger.description = 'Edit user'
    /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'New name',
            schema: { username: 'Joe' }
    } */
    /* #swagger.responses[200] = {
        description: 'Created',
        schema: { status: 'success', user: { $ref: '#/definitions/User' } }
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
        description: 'username error',
        schema: { status: 'error', error: 'username not supplied' }
    } */
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
        var user = users.get(userID);
        if (typeof (user) === 'undefined') {
            res.statusCode = 404
            res.write(JSON.stringify({ status: "error", error: "user not found" }));
        } else {
            var post = JSON.parse(body);
            var username = post["username"]
            if (typeof(username) === 'undefined' || username.length === 0) {
                res.statusCode = 406
                res.write(JSON.stringify({status: "error", error: "username not supplied"}))
            } else {
                var userExistCount = 0
                users.forEach(element => {
                    if (element.getUserName() === username) {
                        userExistCount = userExistCount + 1
                    }
                });

                if (userExistCount === 0) {
                    user.setUserName(username);
                    res.write(JSON.stringify({ status: "success", user: user }));
                } else {
                    res.statusCode = 403
                    res.write(JSON.stringify({ status: "error", error: "user with such username already exist" }));
                }
            }
        }
        res.end();
    });
});

// Notes endpoints
app.get("/api/v1/note", (req, res) => {
    // #swagger.description = 'Get notes'
    // #swagger.parameters['noteID'] = { description: 'Note id' }
    /* #swagger.responses[200] = {
        description: 'Note',
        schema: [{ $ref: '#/definitions/Note' }]
    } */
    /* #swagger.parameters['page'] = {
            in: 'path',
            description: 'Numper of page',
            required: 'false'
    } */
    /* #swagger.parameters['items_per_page'] = {
            in: 'path',
            description: 'Items per page',
            required: 'false'
    } */
    res.setHeader("Content-Type", "application/json");
    var parsedUrl = url.parse(req.url, true); // true to get query as obj
    var page = parsedUrl.query['page'];
    var limit = parsedUrl.query["items_per_page"]
    var noteArray = Array.from(notes.entries())
    if (typeof (page) === 'undefined' || typeof (limit) === 'undefined') {
        res.write(JSON.stringify( noteArray ));
    } else {
        res.write(JSON.stringify(noteArray.slice((page - 1) * limit, page * limit)));
    }
    res.end();
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
    res.setHeader("Content-Type", "application/json");
    var noteID = req.params["noteID"];
    var note = notes.get(noteID);
    if (typeof (note) === 'undefined') {
        res.statusCode = 404;
        res.write(JSON.stringify({ status: "error", error: "note not found" }));
    } else {
        res.write(JSON.stringify( note ));
    }
    res.end();
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
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        var post = JSON.parse(body);
        var title = post["title"];
        var noteData = post["note"];
        var userID = post["userID"];
        if (typeof(userID) === 'undefined' || userID.length === 0) {
            res.statusCode = 406
            res.write(JSON.stringify({status: "error", error: "userID not supplied"}))
        } else {
            var user = users.get(userID);
            if (typeof (user) === 'undefined') {
                res.statusCode = 404;
                res.write(JSON.stringify({ status: "error", error: "user not found" }));
            } else {
                var note = new Note(title, noteData, userID);
                notes.set(note.getID(), note);
                res.write(JSON.stringify({ status: "success", note }));
            }
        }
        res.end();
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
    res.setHeader("Content-Type", "application/json");
    var noteID = req.params["noteID"];
    var note = notes.get(noteID);
    if (typeof (note) === 'undefined') {
        res.statusCode = 404;
        res.write(JSON.stringify({ status: "error", error: "note not found" }));
    } else {
        notes.delete(noteID);
        res.write(JSON.stringify({ status: "success" }));
    }
    res.end();

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
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        var noteID = req.params["noteID"];
        var note = notes.get(noteID);
        if (typeof (note) === 'undefined') {
            res.statusCode = 404
            res.write(JSON.stringify({ status: "error", error: "note not found" }));
        } else {
            var post = JSON.parse(body);
            var title = post["title"]
            var data = post["note"]
            note.setNoteTitle(title);
            note.setNote(data);
            res.write(JSON.stringify({ status: "success", note }));
        }
        res.end();
    });

});

// Links endpoints
app.get("/api/v1/link/:linkID", (req, res) => {
    // #swagger.description = 'Get link by id'
    // #swagger.parameters['noteID'] = { description: 'Link id' }
    /* #swagger.responses[200] = {
        description: 'Link',
        schema: { $ref: '#/definitions/Link' }
    } */
    /* #swagger.responses[404] = {
        description: 'Not found',
        schema: { status: 'error', error: 'link not found' }
    } */
    res.setHeader("Content-Type", "application/json");
    var linkID = req.params["linkID"];
    var link = links.get(linkID);
    if (typeof (link) === 'undefined') {
        res.statusCode = 404;
        res.write(JSON.stringify({ status: "error", error: "link not found" }));
    } else {
        res.write(JSON.stringify( link ));
    }
    res.end();

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
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        var post = JSON.parse(body);
        var noteID = post["noteID"];
        var note = notes.get(noteID);
        if (typeof(note) === 'undefined') {
            res.statusCode = 406
            res.write(JSON.stringify({status: "error", error: "note not found"}))
        } else {
            var link = new Link(noteID);
            links.set(link.getID(), link);
            res.write(JSON.stringify({ status: "success", link }));
        }
        res.end();
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
    res.setHeader("Content-Type", "application/json");
    var linkID = req.params["linkID"];
    var link = links.get(linkID);
    if (typeof (link) === 'undefined') {
        res.statusCode = 404;
        res.write(JSON.stringify({ status: "error", error: "link not found" }));
    } else {
        links.delete(linkID);
        res.write(JSON.stringify({ status: "success" }));
    }
    res.end();

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
    res.setHeader("Content-Type", "application/json");
    var body = '';

    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        var linkID = req.params["linkID"];
        var link = links.get(linkID);
        if (typeof (link) === 'undefined') {
            res.statusCode = 404
            res.write(JSON.stringify({ status: "error", error: "link not found" }));
        } else {
            var post = JSON.parse(body);
            var noteID = post["noteID"];
            if (typeof (noteID) === 'undefined' || noteID.length === 0) {
                res.statusCode = 406
                res.write(JSON.stringify({ status: "error", error: "noteID not supplied" }))
            } else {
                var note = note.get(noteID)
                if (typeof (note) === 'undefined') {
                    res.statusCode = 404
                    res.write(JSON.stringify({ status: "error", error: "note not found" }))
                }
                link.setNoteID(noteID);
                res.write(JSON.stringify({ status: "success", link }));
            }
        }
        res.end();
    });
});

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
