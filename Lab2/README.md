# Working with files and network

Our task was:

* Learn about Node.JS default libs - ftp, http, net.
* Create simple web scrapper.

    Select any news website and parse it. Program need to have such functionality: 
    * Refresh every minute;
    * Get list of HTML data, obviously;
    * Save every news entry as a file in directory;
    * Create sample web server, which will serve files on the net.
    * When clicked on some file - it will open this entry.

## Q&A

1. В чому різниця між setTimeout та setInterval?

* setTimeout allows us to run a function once after the interval of time.
* setInterval allows us to run a function repeatedly, starting after the interval of time, then repeating continuously at that interval.

2. Що таке блокуючий код?

Blocking refers to operations that block further execution until that operation finishes while non-blocking refers to code that doesn’t block execution. Or as Node.js docs puts it, blocking is when the execution of additional JavaScript in the Node.js process must wait until a non-JavaScript operation completes.

Blocking methods execute synchronously while non-blocking methods execute asynchronously.

3. Які переваги асинхронного читання з диску перед синхронним?

Async I/O benefits:

* Faster response times;
* Able to read and write at the same time;
* Do not block execution, due to asyncronous operation.

4. Опишіть різницю між Callbacks API, Promise API та async / await.

* If we should be 100% correct what a callback is, then a callback is a function we pass into another function that accepts another function as an argument. And that function we pass in can be invoked at any time in the future by the function we pass it into. It is then called a higher order function , which accepts a function as an argument.
* Promises, basically, it is like the micro queue but for Promises and it differs a little bit. The micro queue have priority over the callback queue.
for example if we would run this code:
``` js
setTimeout(() => {
  console.log("Using callback queue")
  
}, 0)

new Promise(resolve => resolve(console.log("Using micro queue")))
```
Then, even tho our setTimeout will run the callback directly after 0 seconds and the Promise is set out to do so too, which is immediate, the promise will run its callback first because it using the micro queue and that has priority over the callback queue which the setTimout WEB API method is using.

* Async await is a new way to write asynchronous code and was basically created for simplifying how we can write chained promises.

Async await is nonblocking like we would expect it to be as it is asynchronous, and each async-await is returning a promise with its resolved state.

5. Як обробляються помилки при використанні Promise API?

To handle errors while using Promise API, we can use ```.catch```, which automatically executes when error happends.
For example:
```js
fetch('https://no-such-server.blabla') // rejects
  .then(response => response.json())
  .catch(err => alert(err)) // TypeError: failed to fetch (the text may vary)
```
As you can see, the ```.catch``` doesn’t have to be immediate. It may appear after one or maybe several .then.
The easiest way to catch all errors is to append .catch to the end of chain.

6. Як створити директорію через модуль fs? За що відповідає параметр mode?

To create directory using ```fs``` module, we can use ```fs.mkdir()``` or ```fs.mkdirSync()```.
Parameters:

* path ```<string>``` | ```<Buffer>``` | ```<URL>```
* options ```<Object>``` | ```<integer>```
    * recursive ```<boolean>``` Default: false
    * mode ```<string>``` | ```<integer>``` Not supported on Windows. Default: ```777```, or ```rwxrwxrwx```.
* Returns: 
    * for async ```fs.mkdir()```: ```<Promise>``` Upon success, fulfills with undefined if recursive is false, or the first directory path created if recursive is true.
    * for sync ```fs.mkdirSync()```: ```<string>``` | ```<undefined>```

