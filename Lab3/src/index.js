'use strict';

const express = require('express');
const url = require('url');
const Note = require('./notes');
const uuid = require('uuid');
const app = express();

const host = '0.0.0.0';
const port = 3000;
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}))

var notes = new Map();
var viewNotes = new Map();

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
    
    if (typeof(key) === 'undefined' || typeof(notes.get(key)) === 'undefined') {
        res.render('pages/message', {
            title: "Error",
            message: `Key not found`,
        });
    } else if (typeof(id) === 'undefined') {
        res.render('pages/message', {
            title: "Error",
            message: `Note identificator not found`,
        });
    } else {
        var userNotes = notes.get(key);
        userNotes.forEach(element => {
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

    if (typeof(key) === 'undefined' || typeof(notes.get(key)) === 'undefined') {
        res.render('pages/message', {
            title: "Error",
            message: `Key not found`,
        });
    } else if (typeof(id) === 'undefined') {
        res.render('pages/message', {
            title: "Error",
            message: `Note identificator not found`,
        });
    } else {
        var userNotes = notes.get(key);
        userNotes.forEach(element => {
            if (element.getId() === id) {
                notes.get(key).pop(element);
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

    if (typeof(key) === 'undefined' || typeof(notes.get(key)) === 'undefined') {
        res.render('pages/message', {
            title: "Error",
            message: `Key not found`,
        });
    } else {
        var note = notes.get(key).filter(el => el.getId() === id)[0];
        if (typeof(id) === 'undefined') {
            res.render('pages/message', {
                title: "Error",
                message: `Note identificator not found`,
            });
        } else if (typeof(note.getPublicId()) !== 'undefined') {
            res.render('pages/message', {
                title: "Error",
                message: `Note already have public URL`,
            });
        } else {
            var notePublicId = uuid.v1();

            viewNotes.set(notePublicId, {id: id, key: key})

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
