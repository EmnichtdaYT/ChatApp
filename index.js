const serverAndDatabase = require("./serverAndDatabase.js")
const loginAndRegister = require("./loginAndRegister.js")
const chats = require("./chats.js")
const utils = require("./utils.js")

const app = serverAndDatabase.getApp();
const database = serverAndDatabase.getDatabase();

loginAndRegister.initLoginAndRegister(app, database, utils);
chats.initChats(app, database, utils, loginAndRegister);

serverAndDatabase.startServer();
