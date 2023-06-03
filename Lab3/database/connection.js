const mysql = require('mysql');
const redis = require('redis');

// Opening connection to database
var con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "ruby",
    password: "Legs4Frogs_Mads",
    database: "Notes",
});
con.connect((error) => {
    if (error) throw error;
    console.log("Database connected.");
})

var rcon = redis.createClient();
rcon.on('error', err => { throw err });
rcon.connect();

module.exports = {
    con,
    rcon
};