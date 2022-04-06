const express = require('express');
const ws = require('ws')
var wsServer;

var webSockets = [];

function initWebsocket(server, chats, loginAndRegister) {
    this.chats = chats;
    this.loginAndRegister = loginAndRegister;

    wsServer = new ws.Server({ noServer: true })
    server.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            wsServer.emit('connection', socket, request);
        })
    })

    wsServer.on('connection', socket => {
        var instance = new WebsocketConnection(socket);
        webSockets.push(instance)
    })
}

class WebsocketConnection{
    constructor(socket){
        this.socket = socket;
        registerOnMessageListener(socket);
    }
    registerOnMessageListener(socket){
        socket.on('message', (data) => {
            var message = data.toString();
            if(this.token == null){
                setToken(message)
            }
            registerListener(message);
        })
    }

    setToken(token){
        if(!(token in loginAndRegister.userTokens)){
            this.socket.write(JSON.stringify( {message: "401 - Incorrect token"} ));
            this.socket.destroy();
            return; //Token incorrect
        }
    }
    
    registerListener(id){
        if(!(token in loginAndRegister.userTokens)){
            this.socket.write(JSON.stringify( {message: "401 - Incorrect token"} ));
            this.socket.destroy();
            return; //Token incorrect
        }
        if(!chats.existsChat(id)){
            this.socket.write(JSON.stringify({message: "404 - Chat not found" }));
            return; //Not exist
        }
        if(!chats.hasUserPermissionForChat(this.token, id)){
            this.socket.write(JSON.stringify({ message: "401 - Not authorized" }))
            return; //Not authorized
        }
        this.chats.addChatListener(this, id) //Everything ok c:
        this.socket.write(JSON.stringify({ message: "202 - OK" }))
    }
}

module.exports = {
    initWebsocket,
};