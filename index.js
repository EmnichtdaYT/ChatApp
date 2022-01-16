const serverAndDatabase = require("./serverAndDatabase.js")
const loginAndRegister = require("./loginAndRegister.js")

app = serverAndDatabase.getApp();

loginAndRegister.initLoginAndRegister(app);

serverAndDatabase.startServer();
