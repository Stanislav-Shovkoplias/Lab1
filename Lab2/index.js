const fs = require('fs');
const net = require('net');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');

const HOST = 'localhost';
const PORT = 8080;
const options = {
  host: "www.overclockers.ua",
  port: 443,
  path: "/"
};

const workdir = "./news";

var source = "";

const loadAndParse = async function () {
  console.log("Parser started");
  
  source = "";
  
  var req = https.request(options, (response) => {
    response.on("data", (chunk) => source += chunk);
    response.on("end", () => {
      const $ = cheerio.load(source);
      const selector = 
         "#overblock > #main > #content > #mainpage > div.post";
    
      $(selector).each((parentIndex, parentElement) => {
        $(parentElement)
          .children("div.post_desc")
          .children("h2")
          .children((childId, childElem) => {
            const news_name = $(childElem).text();
            const path = $(childElem).attr('href');
            
            // Create directory if not exists
            if (!fs.existsSync(workdir)) {
              fs.mkdirSync(workdir);
            }

          });
      });
    });
  });
  req.end();
  console.log("Parser ended");
};

// Timer, to perform refresh of information every 60 seconds
(async function() {
  var timer = Date.now();
  
  while(true) {
    if (Date.now() - timer > 60000) {
      console.log("60 seconds passed, refreshing news...");
      await loadAndParse();
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
      response.setHeader("Content-Type", "text/html");
      response.writeHead(200);
      response.write(source);
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
loadAndParse();
app.listen(PORT, HOST, () => {
  console.log(`App is running on http://${HOST}:${PORT}`);
});
