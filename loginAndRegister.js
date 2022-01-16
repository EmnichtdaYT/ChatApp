function initLoginAndRegister(app) {
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

    res.json({ registered: register(user, pass) });
  });

  
  app.get("/:token", (req, res, next) => {
    var token = req.params.token;
    res.json({ tokenCorrect: token in userTokens });
  });
}

var userPasswords = {};
var userTokens = {};

function register(username, password) {
  if(!username || !password || username.length < 3 || password.length < 3){
    return false;
  }

  if (username in userPasswords) {
    return false;
  }
  userPasswords[username] = password;
  return true;
}

function login(username, password) {
  if (!isPasswordCorrect(username, password)) {
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

module.exports = {
  initLoginAndRegister,
  register,
  login,
};
