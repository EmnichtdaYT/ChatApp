let db;

function initLoginAndRegister(app, database) {

  db = database;

  app.post("/login", (req, res, next) => {
    var user = req.body.user;
    var pass = req.body.pass;
    login(user, pass).then((result) => {
      res.json({
        token: result,
      });
    })
  });

  app.post("/register", (req, res, next) => {
    var user = req.body.user;
    var pass = req.body.pass;

    register(user, pass).then((result) => {
      res.json({
        registered: result[0],
        status: result[1]
      });
    });
  });


  app.get("/:token", (req, res, next) => {
    var token = req.params.token;
    res.json({ tokenCorrect: token in userTokens });
  });
}

var userPasswords = {};
var userTokens = {};

async function register(username, password) {
  if (!username || !password || username.length < 3 || password.length < 3) {
    return [false, "username or password too short"];
  }

  var result = await db.query("SELECT COUNT(*) FROM users WHERE name = $1", [username])

  if (result.rows[0].count > 0) {
    return [false, "user already exists"];
  }

  var result = await db.query("INSERT INTO users VALUES ($1, $2)", [username, password])

  return [true, "success"];

}

async function login(username, password) {
  if (await isPasswordCorrect(username, password)) {
    return generateToken(username)
  }
  return null;
}

async function isPasswordCorrect(username, password) {
  var result = await db.query("SELECT * FROM users WHERE name = $1 AND pass = $2", [username, password])
  return result.rows.length == 1;
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

module.exports = {
  initLoginAndRegister,
  register,
  login,
};
