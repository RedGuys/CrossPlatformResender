const {Core} = require("./core/Core");
const {TG} = require("./core/modules/TG");
const {DS} = require("./core/modules/DS");
const {VK} = require("./core/modules/VK");
const configs = require("./configs");

core = new Core();
let DSBot = new DS(configs.DSBot);
let TGBot = new TG(configs.TGBot);
//let VKBot = new VK(configs.VKBot);
core.addTwoWayBridge(
    TGBot.getChat(configs.TGBotTest),
    DSBot.getChat(configs.DSHren)
);
console.info("started!");