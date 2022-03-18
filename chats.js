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

        if (!tokenCorrect) {
            res.json({ tokenCorrect: false });
            return;
        }

        if (!await hasUserPermissionForChat(loginAndRegister.userTokens[token], chatid)) {
            res.json({ hasPermission: false });
            return;
        }

        var re = await db.query("SELECT * FROM chatmessages WHERE chatid = $1", [chatid])

        res.json({ tokenCorrect: true, messages: re.rows })

    })

    app.post("/:token/:chatid", async (req, res, next) => {
        var token = req.params.token;
        var tokenCorrect = token in loginAndRegister.userTokens;
        var chatid = req.params.chatid
        var message = req.body.message;

        if (!tokenCorrect) {
            res.json({ tokenCorrect: false });
            return;
        }

        if (!await hasUserPermissionForChat(loginAndRegister.userTokens[token], chatid)) {
            res.json({ hasPermission: false });
            return;
        }

        if (!message) {
            res.json({ error: "message is not defined" })
            return;
        }

        var messageid = await generateMessageIdForChat(chatid);

        db.query("INSERT INTO chatmessages (chatid, messageid, sentby, message) VALUES ($1, $2, $3, $4)", [chatid, messageid, loginAndRegister.userTokens[token], message])

        res.json({ messageid: messageid });
    })
}

async function hasUserPermissionForChat(user, chatid) {
    var result = await db.query("SELECT COUNT(*) FROM chatpermissions WHERE chatid = $1 AND haspermission = $2", [chatid, user]);

    return result.rows[0].count != 0;
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

module.exports = {
    initChats,
};