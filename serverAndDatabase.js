function initDatabaseAndServer() {
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
}
