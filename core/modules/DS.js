const {Module} = require("./classes/Module");
const {Chat} = require("./classes/Chat");
const Discord = require("discord.js");

class DS extends Module {
    client;
    config;
    chats;

    constructor(config) {
        super(config);
        this.config = config;
        this.client = new Discord.Client();
        this.client.login(config.token);
        this.chats = {};
        this.client.on("message",(message) => {
            if (message.author.bot) return;
            if (message.content === "/getGrpId") {
                message.reply(message.channel.id);
            } else {
                if (this.chats.hasOwnProperty(message.channel.id)) {
                    this.chats[message.channel.id].onMessage(message);
                }
            }
        });
    }

    getChat(config) {
        super.getChat(config);
        config["Bot"] = this;
        let chat = new DSChat(config);
        this.chats[config.group_id] = chat;
        return chat;
    }

    sendMessage(message, to) {
        super.sendMessage(message);
        const channel = this.client.channels.get(to);
        channel.send(message);
    }
}

class DSChat extends Chat {
    cb;
    config;
    constructor(config) {
        super(config);
        this.config = config;
    }

    sendMessage(message) {
        super.sendMessage(message);
        this.config.Bot.sendMessage(message,this.config.group_id);
    }

    setMessageCallBack(cb) {
        super.setMessageCallBack(cb);
        this.cb = cb;
    }

    onMessage(message) {
        super.onMessage(message);
        if(this.cb) {
            this.cb(message.content,{name:message.author.username});
        }
    }
}

module.exports.DS = DS;