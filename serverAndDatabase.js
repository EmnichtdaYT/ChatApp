// Entry Point of the API Server

const express = require("express");

/* Creates an Express application. 
   The express() function is a top-level 
   function exported by the express module.
*/
let app = express();
const Pool = require("pg").Pool;
const cors = require("cors");
const https = require("https");
var fs = require("fs");

let pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "chatapp",
  password: "zoe",
  dialect: "postgres",
  port: 5432,
});

/* To handle the HTTP Methods Body Parser 
   is used, Generally used to extract the 
   entire body portion of an incoming 
   request stream and exposes it on req.body 
*/
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return console.error("Error executing query", err.stack);
    }
    console.log("Connected to Database !");
  });
});

var server;

function startServer() {
  // Require the Routes API
  // Create a Server and run it on the port 3000
  server = https
    .createServer(
      {
        key: fs.readFileSync("/server.key"),
        cert: fs.readFileSync("/server.cert"),
      },
      app
    )
    .listen(3000, function () {
      let host = server.address().address;
      let port = server.address().port;
      // Starting the Server at the port 3000
    });
}

function getApp() {
  return app;
}

function getServer(){
  return server;
}

function getDatabase() {
  return pool;
}

module.exports = {
  getApp,
  getDatabase,
  startServer,
  getServer,
};
