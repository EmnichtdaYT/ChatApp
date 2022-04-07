let db;
let utils;
let loginAndRegister

function initChats(app, database, functions, loginRegister) {

    db = database;
    utils = functions;
    loginAndRegister = loginRegister;

    app.get("/:token/:chatid", async (req, res, next) => {
        var token = req.params.token;
        var tokenCorrect = token in loginAndRegister.userTokens;
        var chatid = req.params.chatid
        var limit = req.query.limit;
        var olderthan = req.query.olderthan;
        var user = loginAndRegister.userTokens[token];

        if (!tokenCorrect) {
            res.json({ tokenCorrect: false });
            return;
        }

        if (!await hasUserPermissionForChat(loginAndRegister.userTokens[token], chatid)) {
            res.json({ hasPermission: false });
            return;
        }

        if (!limit || limit > 200) {
            limit = 50
        }

        var reUsers = await db.query("SELECT haspermission FROM chatpermissions WHERE chatid = $1", [chatid])

        var usersInChat = [];

        for (j = 0; j < reUsers.rows.length; j++) {
            usersInChat[j] = reUsers.rows[j].haspermission;
        }

        var re;
        if (olderthan) {
            re = await db.query("SELECT * FROM chatmessages WHERE chatid = $1 AND timestamp < $2 ORDER BY timestamp DESC LIMIT $3", [chatid, olderthan, limit])
        } else {
            re = await db.query("SELECT * FROM chatmessages WHERE chatid = $1 ORDER BY timestamp DESC LIMIT $2", [chatid, limit])
        }

        res.json({ tokenCorrect: true, user: user, hasPermission: true, users: usersInChat, messages: re.rows })

    })

    app.post("/:token/:chatid", async (req, res, next) => {
        var token = req.params.token;
        var tokenCorrect = token in loginAndRegister.userTokens;
        var chatid = req.params.chatid
        var user = loginAndRegister.userTokens[token];
        var message = req.body.message;


        if (!tokenCorrect) {
            res.json({ tokenCorrect: false });
            return;
        }

        if (!await hasUserPermissionForChat(loginAndRegister.userTokens[token], chatid)) {
            res.json({ tokenCorrect: true, user: user, hasPermission: false });
            return;
        }

        if (!message) {
            res.json({ tokenCorrect: true, user: user, hasPermission: true, error: "message is not defined" })
            return;
        }

        var messageid = await generateMessageIdForChat(chatid);

        db.query("INSERT INTO chatmessages (chatid, messageid, sentby, message) VALUES ($1, $2, $3, $4)", [chatid, messageid, loginAndRegister.userTokens[token], message])

        responseJson = { tokenCorrect: true, user: user, hasPermission: true, messageid: messageid };

        setTimeout(function () { //This is here because I found some sort of bug that the rows are empty at the 2nd message and this fixed it. I know this isn't optimal but I have not yet found another way to fix this
            fireMessageCreateEvent(chatid, messageid)
        }, 100)

        res.json(responseJson);
    })

    app.get("/:token/:chatid/:messageid", async (req, res, next) => {
        var token = req.params.token;
        var tokenCorrect = token in loginAndRegister.userTokens;
        var chatid = req.params.chatid
        var user = loginAndRegister.userTokens[token];
        var messageid = req.params.messageid;

        if (!tokenCorrect) {
            res.json({ tokenCorrect: false });
            return;
        }

        if (!await hasUserPermissionForChat(loginAndRegister.userTokens[token], chatid)) {
            res.json({ tokenCorrect: true, user: user, hasPermission: false });
            return;
        }

        re = await db.query("SELECT * FROM chatmessages WHERE chatid = $1 AND messageid = $2", [chatid, messageid])

        res.json({ tokenCorrect: true, user: user, hasPermission: true, message: re.rows })

    })
}

async function hasUserPermissionForChat(user, chatid) {
    var result = await db.query("SELECT COUNT(*) FROM chatpermissions WHERE chatid = $1 AND haspermission = $2", [chatid, user]);

    return result.rows[0].count != 0;
}

async function fireMessageCreateEvent(chatid, messageid) {
    if (!(chatid in socketListensTo)) {
        return;
    }

    const resultM = await db.query("SELECT * FROM chatmessages WHERE chatid = $1 AND messageid = $2", [chatid, messageid])

    for (socketId in socketListensTo[chatid]) {
        var socket = socketListensTo[chatid][socketId]
        try {
            if (!socket.closed) {

                if (socket.token in loginAndRegister.userTokens) {
                    if (await hasUserPermissionForChat(loginAndRegister.userTokens[socket.token], chatid)) {
                        socket.socket.send(JSON.stringify({ message: resultM.rows }))
                    } else {
                        socketListensTo[chatid] = socketListensTo[chatid].filter(value => value !== socket)
                        socket.socket.send(JSON.stringify({ message: '401 - Not authorized anymore for chat ' + chatid + '. Removed you from listeners.' }))
                    }
                } else {
                    socket.socket.send(JSON.stringify({ message: "401 - Incorrect token" }))
                    socketListensTo[chatid] = socketListensTo[chatid].filter(value => value !== socket)
                    socket.socket.close();
                }
            } else {
                socketListensTo[chatid] = socketListensTo[chatid].filter(value => value !== socket)
            }
        } catch (exception) {
            socketListensTo[chatid] = socketListensTo[chatid].filter(value => value !== socket)
            console.log(exception)
        }
    }
}

async function generateMessageIdForChat(chatid) {
    var messageid = utils.generateRandomString()
    var result = await db.query("SELECT COUNT(*) FROM chatmessages WHERE chatid = $1 AND messageid = $2", [chatid, messageid]);
    if (result.rows[0].count == 0) {
        return messageid;
    } else {
        return generateMessageIdForChat(chatid);
    }
}

async function doesChatExist(id) {
    var result = await db.query("SELECT COUNT(*) FROM chats WHERE chatid = $1", [id])
    return result.rows[0].count > 0;
}

var socketListensTo = {};

function addChatListener(instance, chatid) {
    if (!(chatid in socketListensTo)) {
        socketListensTo[chatid] = [];
    }
    socketListensTo[chatid].push(instance);
}

module.exports = {
    initChats,
    doesChatExist,
    hasUserPermissionForChat,
    addChatListener,
};