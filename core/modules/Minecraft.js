const {Module} = require("./classes/Module");
const {Chat} = require("./classes/Chat");
const WebSocket = require('ws');

class Minecraft extends Module {
    config;
    chats;
    servers;

    constructor(config) {
        super(config);
        this.config = config;
        this.servers = {};
        this.chats = {};
    }

    sendMessage(message, to) {
        super.sendMessage(message);
        this.servers[to].send(JSON.stringify({status:301,text:message}));
    }

    sendMessageWithPhotos(message, attachment, to) {
        super.sendMessageWithPhotos(message, attachment, to);
        this.servers[to].send(JSON.stringify({status:301,text:message}));
    }

    getChat(config) {
        super.getChat(config);
        config["Bot"] = this;
        let ws = new WebSocket(config.host);
        config['Server'] = ws;
        this.servers[config.name] = ws;
        ws.onmessage = (data) => {
            let message = JSON.parse(data.data);
            if(message.status === 301) {
                chat.onMessage(message);
            }
        }
        let chat = new MCChat(config);
        this.chats[config.name] = chat;
        return chat;
    }
}

class MCChat extends Chat {
    config;
    cb;
    photosCb;
    constructor(config) {
        super(config);
        this.config = config;
    }

    sendMessage(message) {
        super.sendMessage(message);
        this.config.Bot.sendMessage(message,this.config.name);
    }

    sendMessageWithPhotos(message, attachment) {
        super.sendMessageWithPhotos(message, attachment);
        this.config.Bot.sendMessageWithPhotos(message, attachment, this.config.name);
    }

    setMessageCallBack(cb) {
        super.setMessageCallBack(cb);
        this.cb = cb;
    }

    setPhotosMessageCallBack(photosCb) {
        super.setPhotosMessageCallBack(photosCb);
        this.photosCb = photosCb;
    }

    onMessage(message) {
        super.onMessage(message);
        if(this.cb) {
            this.cb(message.text, {name: this.config.name});
        }
    }

    onPhotos(message) {
        super.onPhotos(message);
    }
}

module.exports.MC = Minecraft;