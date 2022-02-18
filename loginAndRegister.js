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


  app.get("/:token", async (req, res, next) => {
    var token = req.params.token;
    var tokenCorrect = token in userTokens;

    var array = {};

    if (!tokenCorrect) {
      res.json({ tokenCorrect: false });
      return;
    }

    var result = await db.query("SELECT chatid FROM chatpermissions WHERE haspermission = $1", [userTokens[token]])

    for(i = 0; i < result.rows.length; i++){
      var element = result.rows[i].chatid;
      var re = await db.query("SELECT haspermission FROM chatpermissions WHERE chatid = $1", [element])
      var temparray = [];

      for(j = 0; j < re.rows.length; j++){
        temparray[j] = re.rows[j].haspermission;
      }

      array[element] = temparray;
    }

    res.json({ tokenCorrect: true, chats: array })

  });

  app.get("/:token/:chatid", async (req, res, next) => {
    var token = req.params.token;
    var tokenCorrect = token in userTokens;
    var chatid = req.params.chatid
    
    if(!tokenCorrect){
      res.json({ tokenCorrect: false });
      return;
    }

    if(!await hasUserPermissionForChat(userTokens[token], chatid)){
      res.json({ hasPermission: false });
      return;
    }

    var re = await db.query("SELECT * FROM chatmessages WHERE chatid = $1", [chatid])

    res.json({tokenCorrect: true, messages: re.rows})

  })

  app.post("/:token/:chatid", async (req, res, next) => {
    var token = req.params.token;
    var tokenCorrect = token in userTokens;
    var chatid = req.params.chatid
    var message = req.body.message;

    if(!tokenCorrect){
      res.json({ tokenCorrect: false });
      return;
    }

    if(!await hasUserPermissionForChat(userTokens[token], chatid)){
      res.json({ hasPermission: false });
      return;
    }

    if(!message){
      res.json({ error: "message is not defined" })
      return;
    }

    var messageid = await generateMessageIdForChat(chatid);

    db.query("INSERT INTO chatmessages (chatid, messageid, sentby, message) VALUES ($1, $2, $3, $4)", [chatid, messageid, userTokens[token], message])

    res.json({ messageid: messageid });
  })
}

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

async function hasUserPermissionForChat(user, chatid){
  var result = await db.query("SELECT COUNT(*) FROM chatpermissions WHERE chatid = $1 AND haspermission = $2", [chatid, user]);

  return result.rows[0].count != 0;
}

async function generateMessageIdForChat(chatid){
  var messageid = generateRandomString()
  var result = await db.query("SELECT COUNT(*) FROM chatmessages WHERE chatid = $1 AND messageid = $2", [chatid, messageid]);
  if(result.rows[0].count == 0){
    return messageid;
  }else{
    return generateMessageIdForChat(chatid);
  }
}

module.exports = {
  initLoginAndRegister,
  register,
  login,
};
