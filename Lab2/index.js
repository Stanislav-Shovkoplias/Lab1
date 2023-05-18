const fs = require('fs');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const path = require('path');

// Server setup
const HOST = 'localhost';
const PORT = 8080;
const options = {
  host: "www.overclockers.ua",
  port: 443,
  path: "/"
};

// Working vars
const workdir = path.join(__dirname, 'news');
var source = "";

// Main parser
const loadAndParse = async function () {
  source = "";  
  var new_records = 0;

  var req = https.request(options, (response) => {
    response.setEncoding('utf8'); // Fix broken bytes

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
            const news_name = $(childElem).text().replaceAll('/', '|').replaceAll('%', '');
            const path = $(childElem).attr('href');
            
            // Create directory if not exists
            if (!fs.existsSync(workdir)) {
              fs.mkdirSync(workdir);
            }
            
            // Constructing file path
            var filePath = workdir + `/${news_name}.html`;

            if (!fs.existsSync(filePath)) {
              new_records++;
              var news_source = "";
              var options2 = Object.assign({}, options);
              options2.path = path;
              
              var newsreq = https.request(options2, (response) => {
                response.setEncoding('utf8'); // Fix broken bytes
                response.on("data", (chunk) => news_source += chunk);
                response.on("end", () => {
                  
                  const $ = cheerio.load(news_source);
                  const selector = 
                    "#overblock > #main > #content > #post > #article";

                  fs.appendFileSync(filePath, `<h1>${news_name}</h1>\n`, (err) => { if (err) throw err; });

                  $(selector).children((childId, childElem) => {
                    if (childElem.tagName !== "div" && $(childElem).attr('style') === undefined){
                      // Writing news content to file
                      fs.appendFileSync(filePath, $.html(childElem) + '\n', (err) => { if (err) throw err; });
                    }
                  });

                  fs.appendFileSync(filePath, '<a href="/api/news">-->Go back<--</a>', (err) => { if (err) throw err; });
                });
              });
              newsreq.end();
            } 
          });
      });
      console.log(`There is ${new_records} new records.`);
    });
  });
  req.end();
};

// Timer, to perform refresh of information every 60 seconds
(async function() {
  var timer = Date.now();
  
  const just_true = true;
  while(just_true) {
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
    html_result += `<li><a href="/api/news/${file}">${file.slice(0,-5)}</a></li>`;
  }

  html_result += "</ul>";
  return html_result;
};

const requestListener = function (request, response) {
  var date = new Date();
  console.log(`Request: ${request.method} ${decodeURI(request.url)} was at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} from ${request.socket.remoteAddress}`);
  response.setHeader("Content-Type", "text/html; charset=UTF-8");
  switch (request.url) {
    case "/api/news":
      response.writeHead(200);
      response.write(enumerateDir(workdir));
      response.end();
      break;
    case request.url.startsWith("/api/news") ? request.url : '':
      var file = decodeURI(request.url.split("/")[3]);
      if (file.length === 0 || !fs.existsSync(workdir + `/${file}`)) {
        response.writeHead(404)
        response.write(`Not found: ${file}`);
        response.end();
      }
      else {
        response.writeHead(200);
        fs.readFile(workdir + `/${file}`, function(err, data) {
          if (err) {
            console.log("Error reading file.");
          }
          if (data) {
            response.write(data);
            response.end();
          }
        });
      }
      break;
    default:
      response.writeHead(404);
      response.write("Endpoint not found.\n");
      response.end();
      break;
  }
}


const app = http.createServer(requestListener);
loadAndParse();
app.listen(PORT, HOST, () => {
  console.log(`App is running on http://${HOST}:${PORT}`);
});
