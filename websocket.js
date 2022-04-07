const express = require('express');
const ws = require('ws')
var wsServer;
var loginAndRegister;
var chats;

var webSockets = [];

function initWebsocket(server, chatsInstance, loginAndRegisterInstance) {
    chats = chatsInstance;
    loginAndRegister = loginAndRegisterInstance;

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
        this.registerOnMessageListener(socket);
    }
    registerOnMessageListener(socket){
        socket.on('message', (data) => {
            var message = data.toString();
            if(this.token == null){
                this.setToken(message)
            }else{
                this.registerListener(message);
            }
        })
    }

    setToken(token){
        if(!(token in loginAndRegister.userTokens)){
            this.socket.send(JSON.stringify( {message: "401 - Incorrect token"} ));
            this.socket.close();
            return; //Token incorrect
        }
        this.token = token;
    }
    
    async registerListener(id){
        if(!(this.token in loginAndRegister.userTokens)){
            this.socket.send(JSON.stringify( {message: "401 - Incorrect token"} ));
            this.socket.close();
            return; //Token incorrect
        }
        if(!await chats.doesChatExist(id)){
            this.socket.send(JSON.stringify({message: "404 - Chat not found" }));
            return; //Not exist
        }
        if(!await chats.hasUserPermissionForChat(loginAndRegister.userTokens[this.token], id)){
            this.socket.send(JSON.stringify({ message: "401 - Not authorized" }))
            return; //Not authorized
        }
        chats.addChatListener(this, id) //Everything ok c:
        this.socket.send(JSON.stringify({ message: "202 - OK" }))
    }
}

module.exports = {
    initWebsocket,
};