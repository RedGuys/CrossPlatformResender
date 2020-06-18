const {Module} = require("./classes/Module");
const {Chat} = require("./classes/Chat");
const axios = require('axios');
const FormData = require('form-data');
const https = require('https');
const fs = require('fs');
const temp = require('temp');
const path = require("path");
const url = require("url");
const api = require("node-vk-bot-api/lib/api");
const VkBot = require("node-vk-bot-api");

class VK extends Module {
    bot;
    config;
    chats;

    constructor(config) {
        super(config);
        this.config = config;
        this.bot = new VkBot(config.token);
        this.bot.startPolling();
        this.chats = {};
        this.bot.event('message_new', (data) => {
            if(data.message.text === "/getGrpId") {
                data.reply(data.message.peer_id);
            } else {
                if (this.chats.hasOwnProperty(data.message.peer_id)) {
                    if(data.message.attachments.length === 0) {
                        this.chats[data.message.peer_id].onMessage(data);
                    } else {
                        this.chats[data.message.peer_id].onPhotos(data);
                    }
                }
            }
        });
    }

    sendMessage(message, to) {
        super.sendMessage(message);
        this.bot.execute('messages.send',{
            message: message,
            peer_id: to,
            random_id: 0
        }).catch(function (reason) {
            if(reason) console.log(reason);
        });
    }

    sendMessageWithPhotos(message, attachment, to) {
        super.sendMessageWithPhotos(message, attachment, to);
        for (let attachmentItem of attachment) {
            this.uploadFile(attachmentItem.file,to).then((attch) => {
                this.sendAttachment(to,attch);
            }).catch();
        }
        this.bot.sendMessage(to, message).catch();
    }

    getChat(config) {
        super.getChat(config);
        config["Bot"] = this;
        config["rawBot"] = this.bot;
        let chat = new VKChat(config);
        this.chats[config.group_id] = chat;
        return chat;
    }

    uploadFile(file, peerId) {
        return new Promise((resolve, reject) => {
            api('photos.getMessagesUploadServer', {
                peer_id: peerId,
                v:"5.110",
                access_token: this.config.token
            }).then(response => {

                try {
                    const {upload_url: url} = response.response;
                    const form = new FormData();

                    form.append('photo', fs.createReadStream(file));

                    axios.post(url, form, {
                        headers: form.getHeaders(),
                    }).then(data => {
                        data.data.access_token = this.config.token;
                        data.data.v = "5.110";
                        api('photos.saveMessagesPhoto', data.data).then(response => {
                            resolve("photo"+response.response[0].owner_id+"_"+response.response[0].id);
                        }).catch()
                    }).catch();
                } catch (error) {
                    reject(error)
                }
            }).catch(
            )
        })
    }

    sendAttachment(to,attachment) {
        this.bot.execute("messages.send", {
            peer_id: to,
            random_id: '0',
            attachment: attachment
        }).catch();
    }
}

class VKChat extends Chat {
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
            this.config.rawBot.execute('users.get', {
                user_ids: message.message.from_id
            }).then((response) => {
                this.cb(message.message.text, {name: response[0].first_name + " " + response[0].last_name});
            });
        }
    }

    onPhotos(message) {
        super.onPhotos(message);
        if(this.photosCb) {
            this.config.rawBot.execute('users.get', {
                user_ids: message.message.from_id
            }).then((response) => {

                function downloadFile(urls, files, folder, message, photosCb) {
                    let uri = urls.shift();
                    if (uri === undefined) {
                        let text = message.message.text ? message.message.text : "";
                        photosCb(text, {name: response[0].first_name + " " + response[0].last_name}, files);
                    } else {
                        let pathToFile = path.join(folder, decodeURIComponent(path.basename(url.parse(uri).pathname)));
                        let file = fs.createWriteStream(pathToFile);
                        https.get(uri, function (response) {
                            response.pipe(file);
                            response.on("end", () => {
                                let object = {"file": pathToFile, "url": uri};
                                files.push(object);
                                downloadFile(urls, files, folder, message, photosCb);
                            });
                        });
                    }
                }

                let urls = [];
                let files = [];
                let folder = temp.mkdirSync("CrossPlatform-VK");
                for (let attachment of message.message.attachments) {
                    if(attachment.type === "photo") {
                        urls.push(attachment.photo.sizes[attachment.photo.sizes.length-1].url);
                    }
                }
                downloadFile(urls, files, folder, message, this.photosCb);

            });
        }
    }
}

module.exports.VK = VK;