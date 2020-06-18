const {Module} = require("./classes/Module");
const {Chat} = require("./classes/Chat");
const https = require('https');
const fs = require('fs');
const temp = require('temp');
const path = require("path");
const url = require("url");
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
                    if(message.attachments.size === 0) {
                        this.chats[message.channel.id].onMessage(message);
                    } else {
                        this.chats[message.channel.id].onPhotos(message);
                    }
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
        this.client.channels.fetch(to)
            .then(channel =>
                channel.send(message)
            );
    }

    sendMessageWithPhotos(message, attachment, to) {
        super.sendMessageWithPhotos(message, attachment, to);
        this.client.channels.fetch(to)
            .then((channel) => {
                let files = [];
                for (let attachmentItem of attachment) {
                    let item = {};
                    item.attachment = attachmentItem.file;
                    item.name = path.basename(attachmentItem.file);
                    files.push(item);
                }

                channel.send(message, {"files":files});
            });
    }

}

class DSChat extends Chat {
    cb;
    photosCb;
    config;
    constructor(config) {
        super(config);
        this.config = config;
    }

    sendMessage(message) {
        super.sendMessage(message);
        this.config.Bot.sendMessage(message,this.config.group_id);
    }

    sendMessageWithPhotos(message,attachment) {
        super.sendMessageWithPhotos(message,arguments);
        this.config.Bot.sendMessageWithPhotos(message,attachment,this.config.group_id);
    }

    setMessageCallBack(cb) {
        super.setMessageCallBack(cb);
        this.cb = cb;
    }

    setPhotosMessageCallBack(photosCb) {
        super.setPhotosMessageCallBack(photosCb);
        this.mediaCb = photosCb;
    }

    onMessage(message) {
        super.onMessage(message);
        if(this.cb) {
            this.cb(message.content,{name:message.author.username});
        }
    }

    onPhotos(message) {

        function downloadFile(urls,files,folder,message,photosCb) {
            let uri = urls.shift();
            if(uri === undefined) {
                let text = message.content ? message.content : "";
                photosCb(text,{name:message.author.username},files);
            } else {
                let pathToFile = path.join(folder,decodeURIComponent(path.basename(url.parse(uri).pathname)));
                let file = fs.createWriteStream(pathToFile);
                https.get(uri,function (response) {
                    response.pipe(file);
                    response.on("end", () => {
                        let object = {"file":pathToFile,"url":uri};
                        files.push(object);
                        downloadFile(urls,files,folder,message,photosCb);
                    });
                });
            }
        }

        super.onPhotos(message);
        if(this.photosCb) {
            let urls = [];
            let files = [];
            let folder = temp.mkdirSync("CrossPlatform-DS");
            for (let attachment of message.attachments) {
                urls.push(attachment[1].url);
            }
            downloadFile(urls,files,folder,message,this.photosCb);
        }
    }
}

module.exports.DS = DS;