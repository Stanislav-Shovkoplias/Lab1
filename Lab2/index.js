const fs = require('fs');
const net = require('net');
const http = require('http');

const HOST = 'localhost';
const PORT = 8080;

// Timer, to perform refresh of information every 60 seconds
(async function() {
  var timer = Date.now();
  
  while(true) {
    if (Date.now() - timer > 60000) {
      console.log("60 seconds passed, refreshing news...");
      timer = Date.now();
    }
    await sleep(1000);
  }

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
})();


const requestListener = function (request, response) {
  var date = new Date();
  console.log(`Request: ${request.method} ${request.url} was at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
  switch (request.url) {
    case "/api/news":
      response.writeHead(200);
      response.write("News web parser.\n");
      response.end();
      break;
    default:
      response.writeHead(404);
      response.write("Endpoint not found.\n");
      response.end();
      break;
  };
}


const app = http.createServer(requestListener);
app.listen(PORT, HOST, () => {
  console.log(`App is running on http://${HOST}:${PORT}`);
});
