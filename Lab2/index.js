const fs = require('fs');
const net = require('net');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const path = require('path');

const HOST = 'localhost';
const PORT = 8080;
const options = {
  host: "www.overclockers.ua",
  port: 443,
  path: "/"
};

const workdir = path.join(__dirname, 'news');

var source = "";

const loadAndParse = async function () {
  source = "";
  
  var req = https.request(options, (response) => {
    response.on("data", (chunk) => source += chunk);
    
    response.on("end", () => {
      // Loading source code
      const $ = cheerio.load(source);
      const selector = 
         "#overblock > #main > #content > #mainpage > div.post";
    
      // Filtering content by selector
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
            
            // Constructing file path
            var filePath = workdir + `/${news_name}.html`;

            if (!fs.existsSync(filePath)) {
              var news_source = "";
              var options2 = Object.assign({}, options);
              options2.path = path;
              
              var newsreq = https.request(options2, (response) => {
                response.on("data", (chunk) => news_source += chunk);
                response.on("end", () => {
                  
                  const $ = cheerio.load(news_source);
                  const selector = 
                    "#overblock > #main > #content > #post > #article";

                  $(selector).children((childId, childElem) => {
                    if (childElem.tagName !== "div" && $(childElem).attr('style') === undefined){
                      // Writing news content to file
                      fs.appendFile(filePath, $.html(childElem) + '\n', (err) => { if (err) throw err; });
                    }
                  });
                });
              });
              newsreq.end();
            } 
          });
      });
    });
  });
  req.end();
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


const enumerateDir = function(directoryPath) {
  var html_result = "<h1>List of news:</h1><ul>"
  var files = fs.readdirSync(directoryPath);

  for(const file of files) {
    html_result += `<li><a href="/api/news/${file}">${file}</a></li>`;
  }

  html_result += "</ul>";
  return html_result;
};

const requestListener = function (request, response) {
  var date = new Date();
  console.log(`Request: ${request.method} ${request.url} was at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
  response.setHeader("Content-Type", "text/html; charset=UTF-8");
  switch (request.url) {
    case "/api/news":
      response.writeHead(200);
      response.write(enumerateDir(workdir));
      response.end();
      break;
    case request.url.startsWith("/api/news") ? request.url : '':
      var file = decodeURI(request.url.split("/")[3]);
      response.writeHead(200);
      response.write(fs.readFileSync(workdir + `/${file}`));
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
