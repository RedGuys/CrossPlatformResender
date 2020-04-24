const {Core} = require("./core/Core");
const {VK} = require("./core/modules/VK");
const {TG} = require("./core/modules/TG");
const {DS} = require("./core/modules/DS");
const configs = require("./configs");

core = new Core();
let DSBot = new DS(configs.DSBot);
let VKBot = new VK(configs.VKBot);
core.addTwoWayBridge(
    DSBot.getChat(configs.DSCommands),
    VKBot.getChat(configs.VKBotTest));
console.info("started!");