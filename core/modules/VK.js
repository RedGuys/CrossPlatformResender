const {Module} = require("./classes/Module");
const VkBot = require("node-vk-bot-api");

class VK extends Module {
    v = 5.101;
    bot;
    MessageCallBack;
    config;
    constructor(config) {
        super(config);
        this.config = config;
        this.bot = new VkBot(config.token);
        this.bot.startPolling();
        this.bot.event('message_new', (data) => {
            if(data.message.text === "/getGrpId") {
                data.reply(data.message.peer_id);
            }
            if(data.message.peer_id === config.group_id) {
                if (this.MessageCallBack) {
                    this.bot.execute('users.get', {
                        user_ids: data.message.from_id
                    }).then((response) => {
                        this.MessageCallBack(data.message.text, {name: response[0].first_name + " " + response[0].last_name});
                    });
                }
            }
        });
    }

    SetMessageCallBack(cb) {
        super.SetMessageCallBack(cb);
        this.MessageCallBack = cb;
    }

    sendMessage(message) {
        super.sendMessage(message);
        this.bot.execute('messages.send',{
            message: message,
            peer_id: this.config.group_id,
            random_id: 0
        }).catch(function (reason) {
            if(reason) console.log(reason);
        });
    }
}

module.exports.VK = VK;