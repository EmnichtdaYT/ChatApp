// Entry Point of the API Server 
  
const express = require('express');
  
/* Creates an Express application. 
   The express() function is a top-level 
   function exported by the express module.
*/
const app = express();
const Pool = require('pg').Pool;
const cors = require('cors');
  
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'chatapp',
    password: 'zoe',
    dialect: 'postgres',
    port: 5432
});
  
  
/* To handle the HTTP Methods Body Parser 
   is used, Generally used to extract the 
   entire body portion of an incoming 
   request stream and exposes it on req.body 
*/
const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
  
  
pool.connect((err, client, release) => {
    if (err) {
        return console.error(
            'Error acquiring client', err.stack)
    }
    client.query('SELECT NOW()', (err, result) => {
        release()
        if (err) {
            return console.error(
                'Error executing query', err.stack)
        }
        console.log("Connected to Database !")
    })
})
  
app.get('/testdata', (req, res, next) => {
    console.log("TEST DATA :");
    pool.query('Select * from test')
        .then(testData => {
            console.log(testData);
            res.send(testData.rows);
        })
})

app.post('/testdata', (req, res, netx) => {
    console.log("TEST DATA POST");
    req.body;
    pool.query("INSERT INTO test (id) VALUES (" + req.body.data + ")")
    console.log(req.body.data);
    res.json(JSON.parse('{"status":"success"}'));
})
  
app.get('/generalchat', (req, res, next) => {
    console.log("GENERALCHAT:");
    pool.query('Select * from generalchat')
        .then(testData => {
            console.log(testData);
            res.send(testData.rows);
        })
})

app.post('/test', (req, res, next) => {
    console.log("test")
    res.json(req.body);
})

app.post('/generalchat', (req, res, next) => {
    console.log("GENERALCHAT POST");
    req.body;
    pool.query("INSERT INTO generalchat (message) VALUES ('" + req.body.data + "')")
    console.log(req.body.data);
    res.json({status:'success'});
})



app.get('/:token', (req, res, next) => {
    res.json({token:req.params.token});
})
  
app.get('/login', (req, res, next) => {
    res.json({
        user:req.body.user,
        pass:req.body.pass
    })
})



// Require the Routes API  
// Create a Server and run it on the port 3000
const server = app.listen(3000, function () {
    let host = server.address().address
    let port = server.address().port
    // Starting the Server at the port 3000
})