const swaggerAutogen = require('swagger-autogen')();
const uuid = require('uuid');

const doc = {
  info: {
    version: '',      // by default: '1.0.0'
    title: 'Notes app',        // by default: 'REST API'
    description: 'Simple app for manage notes',  // by default: ''
  },
  host: 'localhost:3000',      // by default: 'localhost:3000'
  basePath: '/',  // by default: '/'
  schemes: [],   // by default: ['http']
  consumes: [],  // by default: ['application/json']
  produces: [],  // by default: ['application/json']
  tags: [        // by default: empty Array
    {
      name: '',         // Tag name
      description: '',  // Tag description
    },
    // { ... }
  ],
  securityDefinitions: {},  // by default: empty object
  definitions: {
    User: {
        userID: uuid.v1(),
        username: 'Ivan'
    },
    Note: {
        id: uuid.v1(),
        userID: uuid.v1(),
        title: 'Title',
        note: 'Content'
    },
    Note_nid: {
        userID: uuid.v1(),
        title: 'Title',
        note: 'Content'
    },
    Link: {
        id: uuid.v1(),
        noteID: uuid.v1()
    },
    Link_nid: {
        noteID: uuid.v1()
    }
  },          // by default: empty object (Swagger 2.0)
  components: {}            // by default: empty object (OpenAPI 3.x)
}; 

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js'];

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc)