// Entry Point of the API Server

const express = require("express");

/* Creates an Express application. 
   The express() function is a top-level 
   function exported by the express module.
*/
const app = express();
const Pool = require("pg").Pool;
const cors = require("cors");

const pool = new Pool({
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

app.get("/testdata", (req, res, next) => {
  console.log("TEST DATA :");
  pool.query("Select * from test").then((testData) => {
    console.log(testData);
    res.send(testData.rows);
  });
});

app.post("/testdata", (req, res, netx) => {
  console.log("TEST DATA POST");
  req.body;
  pool.query("INSERT INTO test (id) VALUES (" + req.body.data + ")");
  console.log(req.body.data);
  res.json(JSON.parse('{"status":"success"}'));
});

app.get("/generalchat", (req, res, next) => {
  console.log("GENERALCHAT:");
  pool.query("Select * from generalchat").then((testData) => {
    console.log(testData);
    res.send(testData.rows);
  });
});

app.post("/test", (req, res, next) => {
  console.log("test");
  res.send(req.body);
});

app.post("/generalchat", (req, res, next) => {
  console.log("GENERALCHAT POST");
  req.body;
  pool.query(
    "INSERT INTO generalchat (message) VALUES ('" + req.body.data + "')"
  );
  console.log(req.body.data);
  res.json({ status: "success" });
});

app.post("/login", (req, res, next) => {

  var user = req.body.user;
  var pass = req.body.pass;

  res.json({
    token: login(user, pass),
  });
});

app.post("/register", (req, res, next) => {
    var user = req.body.user;
    var pass = req.body.pass;

    res.json({registered: register(user, pass)})
})

app.get("/:token", (req, res, next) => {
  var token = req.params.token;
  res.json({ tokenCorrect: token in userTokens });
});

var userPasswords = {};
var userTokens = {};

function register(username, password) {
  if (username in userPasswords) {
    return false;
  }
  userPasswords[username] = password;
  return true;
}

function login(username, password){
    if(!isPasswordCorrect(username, password)){
        return null;
    }

    return generateToken(username);
}

function isPasswordCorrect(username, password) {
  if (!username in userPasswords) {
    return false;
  }

  if (userPasswords[username] === password) {
    return true;
  }

  return false;
}

function generateRandomString() {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function generateToken(username) {
  var token = generateRandomString();
  if (token in userTokens) {
    generateToken(username);
    return;
  }
  userTokens[token] = username;
  return token;
}

// Require the Routes API
// Create a Server and run it on the port 3000
const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;
  // Starting the Server at the port 3000
});
