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