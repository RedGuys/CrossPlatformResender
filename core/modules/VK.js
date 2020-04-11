const {Module} = require("./classes/Module");
const {Chat} = require("./classes/Chat");
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
                    this.chats[data.message.peer_id].onMessage(data);
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

    getChat(config) {
        super.getChat(config);
        config["Bot"] = this;
        config["rawBot"] = this.bot;
        let chat = new VKChat(config);
        this.chats[config.group_id] = chat;
        return chat;
    }
}

class VKChat extends Chat {
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
            this.config.rawBot.execute('users.get', {
                user_ids: message.message.from_id
            }).then((response) => {
                this.cb(message.message.text, {name: response[0].first_name + " " + response[0].last_name});
            });
        }
    }
}

module.exports.VK = VK;