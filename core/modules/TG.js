const {Module} = require("./classes/Module");
const {Chat} = require("./classes/Chat");
const TGBotLib = require('node-telegram-bot-api');
const Proxy = require("../Proxy");

class TG extends Module {
    bot;
    config;
    chats;

    constructor(config) {
        super(config);
        this.config = config;
        this.chats = {};
        this.bot = new TGBotLib(config.token, config.options);
        console.log("TG inited");
        this.bot.on('message', (msg) => {
            if (msg.text === "/getGrpId") {
                this.bot.sendMessage(msg.chat.id, msg.chat.id.toString());
            } else {
                if (this.chats.hasOwnProperty(msg.chat.id)) {
                    this.chats[msg.chat.id].onMessage(msg);
                }
            }
        });

        this.bot.on('polling_error', (error) => {
            console.log(error);
        });
    }

    sendMessage(message, to) {
        super.sendMessage(message);
        this.bot.sendMessage(to, message);
    }

    getChat(config) {
        super.getChat(config);
        config["Bot"] = this;
        let chat = new TGChat(config);
        this.chats[config.group_id] = chat;
        return chat;
    }
}

class TGChat extends Chat {
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
            if(message.from.last_name !== undefined) {
                this.cb(message.text, {name: message.from.first_name + " " + message.from.last_name});
            } else {
                this.cb(message.text, {name: message.from.first_name});
            }
        }
    }
}

module.exports.TG = TG;