const {Module} = require("./classes/Module");
const TGBotLib = require('node-telegram-bot-api');
const Proxy = require("../Proxy");

class TG extends Module {
    messageCallBack;
    bot;
    config;

    constructor(config) {
        super(config);
        this.config = config;
        let proxy = Proxy.getProxy((ip) =>{
            this.bot = new TGBotLib(config.token, {polling: true, request: {proxy: "http://" + ip}});
            console.log("TG inited");
            this.bot.on('message', (msg) => {
                if (msg.text === "/getGrpId") {
                    this.bot.sendMessage(msg.chat.id, msg.chat.id.toString());
                } else {
                    if (msg.chat.id === config.group_id) {
                        if (this.messageCallBack) {
                            this.messageCallBack(msg.text, {name: msg.from.first_name + " " + msg.from.last_name});
                        }
                    }
                }
            });
            this.bot.on('polling_error', (error) => {
                console.log(error);
            });
        });
    }

    SetMessageCallBack(cb) {
        super.SetMessageCallBack(cb);
        this.messageCallBack = cb;
    }

    sendMessage(message) {
        super.sendMessage(message);
        this.bot.sendMessage(this.config.group_id, message);
    }
}
module.exports.TG = TG;