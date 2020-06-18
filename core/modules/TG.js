const fs = require("fs");
const temp = require('temp');
const https = require('https');
const {Module} = require("./classes/Module");
const {Chat} = require("./classes/Chat");
const TGBotLib = require('node-telegram-bot-api');
const path = require("path");
const url = require("url");
const Proxy = require("../Proxy");

class TG extends Module {
    bot;
    config;
    chats;

    constructor(config) {
        super(config);
        process.env["NTBA_FIX_350"] = 1;
        this.config = config;
        this.chats = {};
        this.bot = new TGBotLib(config.token, config.options);
        this.bot.on('text', (msg) => {
            if (msg.text === "/getGrpId") {
                this.bot.sendMessage(msg.chat.id, msg.chat.id.toString());
            } else {
                if (this.chats.hasOwnProperty(msg.chat.id)) {
                    this.chats[msg.chat.id].onMessage(msg);
                }
            }
        });

        this.bot.on('photo', (msg) => {
            if (this.chats.hasOwnProperty(msg.chat.id)) {
                this.chats[msg.chat.id].onPhotos(msg);
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

    sendMessageWithPhotos(message, attachment, to) {
        super.sendMessageWithPhotos(message, attachment, to);
        for (let attachmentItem of attachment) {
            this.bot.sendPhoto(to, attachmentItem.url);
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
    cb;
    photosCb;
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
        this.config.Bot.sendMessageWithPhotos(message, attachment, this.config.group_id);
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
            if(message.from.last_name !== undefined) {
                this.cb(message.text, {name: message.from.first_name + " " + message.from.last_name});
            } else {
                this.cb(message.text, {name: message.from.first_name});
            }
        }
    }

    onPhotos(message) {
        super.onPhotos(message);
        if(this.photosCb) {
            let callback = this.photosCb;
            let folder = temp.mkdirSync("CrossPlatform-TG");
            this.config.Bot.bot.downloadFile(message.photo[message.photo.length - 1].file_id,folder).then((file) => {
                this.config.Bot.bot.getFileLink(message.photo[message.photo.length - 1].file_id).then((link) => {
                    if (message.from.last_name !== undefined) {
                        callback("", {name: message.from.first_name + " " + message.from.last_name}, {
                            url: link,
                            file: file
                        });
                    } else {
                        callback("", {name: message.from.first_name}, [{
                            url: link,
                            file: file
                        }]);
                    }
                });
            });
        }
    }
}

module.exports.TG = TG;