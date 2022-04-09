let db;
let utils;

function initLoginAndRegister(app, database, functions) {

  db = database;
  utils = functions;

  app.post("/login", (req, res, next) => {
    var user = req.body.user;
    var pass = req.body.pass;
    login(user, pass).then((result) => {
      res.json({
        token: result,
      });
      var host = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      if(result==null){
        console.log("Failed login request for user " + user + " from " + host)
      }else{
        console.log("Successful login request for user " + user + " from " + host)
      }
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
      var host = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      if(result[0]){
        console.log("User " + user + " registered successful from ip " + host)
      }else{
        console.log("Failed register request from " + host)
      }
    });
  });


  app.get("/:token", async (req, res, next) => {
    var token = req.params.token;
    var tokenCorrect = token in userTokens;
    var user = userTokens[token];

    var array = {};

    if (!tokenCorrect) {
      res.json({ tokenCorrect: false });
      return;
    }

    var result = await db.query("SELECT chatid FROM chatpermissions WHERE haspermission = $1", [userTokens[token]])

    for (i = 0; i < result.rows.length; i++) {
      var element = result.rows[i].chatid;
      var re = await db.query("SELECT haspermission FROM chatpermissions WHERE chatid = $1", [element])
      var temparray = [];

      for (j = 0; j < re.rows.length; j++) {
        temparray[j] = re.rows[j].haspermission;
      }

      array[element] = temparray;
    }

    res.json({ tokenCorrect: true, user: user, chats: array })

  });

  app.post("/:token", async (req, res, next) => {
    var token = req.params.token;
    var tokenCorrect = token in userTokens;
    var user = userTokens[token];
    var users = req.body;

    if (!tokenCorrect) {
      res.json({ tokenCorrect: false });
      return;
    }

    if (!users || users.length < 1) {
      res.json({ tokenCorrect: true, user: user, message: "User list is empty." })
      return;
    }

    var message;
    var usersToAdd = [];

    for (userToAddId in users) {
      var userToAdd = users[userToAddId];
      if (!await isUserExisting(userToAdd) || user == userToAdd) {
        if (!message) message = "The following users couldn't be added: " + userToAdd;
        else message += ", " + userToAdd;
      }else{
        usersToAdd.push(userToAdd);
      }
    }

    if(usersToAdd.length < 1){
      res.json({ tokenCorrect: true, message: message })
      return;
    }

    var chatid = await generateChatid();

    await db.query("INSERT INTO chats (chatid) VALUES ($1)", [chatid]);

    

    for (userToAdd in usersToAdd) {
      db.query("INSERT INTO chatpermissions (chatid, haspermission) VALUES ($1, $2)", [chatid, usersToAdd[userToAdd]])
    }

    await db.query("INSERT INTO chatpermissions (chatid, haspermission) VALUES ($1, $2)", [chatid, user])
    usersToAdd.push(user)

    res.json({ tokenCorrect: true, user: user, chatid: chatid, users: usersToAdd, message: message })
  })
}

var userTokens = {};

async function register(username, password) {
  if (!username || !password || username.length < 3 || password.length < 3) {
    return [false, "username or password too short"];
  }

  if(username.includes("<") || username.includes(">") || username.includes("\"") || username.includes("\\") || username.includes("'")){
    return [false, "Username contains illegal characters!"]
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
  var result = await db.query("SELECT user FROM users WHERE name = $1 AND pass = $2", [username, password])
  return result.rows.length == 1;
}

function generateToken(username) {
  var token = utils.generateRandomString();
  if (token in userTokens) {
    generateToken(username);
    return;
  }
  for(userToken in userTokens){
    if(userTokens[userToken] == username){
      delete userTokens[userToken];
    }
  }
  userTokens[token] = username;
  return token;
}

async function isUserExisting(user) {
  var result = await db.query("SELECT name FROM users WHERE name = $1", [user])
  return result.rows.length == 1;
}

async function generateChatid() {
  var chatid = utils.generateRandomString()
  var result = await db.query("SELECT COUNT(*) FROM chats WHERE chatid = $1", [chatid]);
  if (result.rows[0].count == 0) {
    return chatid;
  } else {
    return generateChatid();
  }
}

module.exports = {
  initLoginAndRegister,
  register,
  login,
  isUserExisting,
  userTokens,
};
