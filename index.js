const serverAndDatabase = require("./serverAndDatabase.js")
const loginAndRegister = require("./loginAndRegister.js")

const app = serverAndDatabase.getApp();
const database = serverAndDatabase.getDatabase();

loginAndRegister.initLoginAndRegister(app, database);

serverAndDatabase.startServer();
