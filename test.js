app.get("/testdata", (req, res, next) => {
  console.log("TEST DATA :");
  pool.query("Select * from test").then((testData) => {
    console.log(testData);
    res.send(testData.rows);
  });
});

app.post("/testdata", (req, res, next) => {
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
