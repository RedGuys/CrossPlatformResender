const {Module} = require("./classes/Module");
const {Chat} = require("./classes/Chat");
const { Telegraf } = require('telegraf')
const TGBotLib = Telegraf;
const fs = require("fs");
const Proxy = require("../Proxy");

class TG extends Module {
    bot;
    config;
    chats;

    constructor(config) {
        super(config);
        this.config = config;
        this.chats = {};
        this.bot = new TGBotLib(config.token, {telegram:config.options});
        this.bot.launch();
        this.bot.on('text', (msg) => {
            if (msg.update.message.text === "/getGrpId") {
                this.bot.sendMessage(msg.update.message.chat.id, msg.update.message.chat.id.toString());
            } else {
                if (this.chats.hasOwnProperty(msg.update.message.chat.id)) {
                    this.chats[msg.update.message.chat.id].onMessage(msg);
                }
            }
        });
    }

    sendMessage(message, to) {
        super.sendMessage(message);
        this.bot.sendMessage(to, message);
    }

    sendMessageWithPhotos(message, attachment, to) {
        super.sendMessageWithPhotos(message, attachment, to);
        for (let attachmentItem of attachment) {
            const buffer = fs.readFileSync(attachmentItem.file);
            this.bot.sendPhoto(to, buffer);
        }
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

    sendMessageWithPhotos(message, attachment) {
        super.sendMessageWithPhotos(message, attachment);
        this.config.Bot.sendMessageWithPhotos(message,attachment,this.config.group_id);
    }

    setMessageCallBack(cb) {
        super.setMessageCallBack(cb);
        this.cb = cb;
    }

    onMessage(message) {
        super.onMessage(message);
        message.telegram.sendCopy(message.update.message.chat.id,message.update.message);
        if(this.cb) {
            if(message.from.last_name !== undefined) {
                this.cb(message.update.message.text, {name: message.from.first_name + " " + message.from.last_name});
            } else {
                this.cb(message.update.message.text, {name: message.from.first_name});
            }
        }
    }
}

module.exports.TG = TG;