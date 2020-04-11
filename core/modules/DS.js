const {Module} = require("./classes/Module");
const Discord = require("discord.js");

class DS extends Module {
    client;
    messageCallback;
    config;

    constructor(config) {
        super(config);
        this.config = config;
        this.client = new Discord.Client();
        this.client.login(config.token);
        this.client.on("message",(message) => {
            if(message.content === "/getGrpId") {
                message.reply(message.channel.id);
            } else {
                if(config.group_id === message.channel.id) {
                    if(this.messageCallback) {
                        this.messageCallback(message.content,{name:message.author.username});
                    }
                }
            }
        });
    }

    SetMessageCallBack(cb) {
        super.SetMessageCallBack(cb);
        this.messageCallback = cb;
    }

    sendMessage(message) {
        super.sendMessage(message);
        const channel = this.client.channels.get(this.config.group_id);
        channel.send(message);
    }
}

module.exports.DS = DS;