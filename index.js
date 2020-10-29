const {Core} = require("./core/Core");
const {TG} = require("./core/modules/TG");
const {DS} = require("./core/modules/DS");
const {VK} = require("./core/modules/VK");
const {MC} = require("./core/modules/Minecraft");
const configs = require("./configs");

core = new Core();
//et DSBot = new DS(configs.DSBot);
let TGBot = new TG(configs.TGBot);
//let VKBot = new VK(configs.VKBot);
let MCBot = new MC(configs.MCServer);
core.addTwoWayBridge(
    TGBot.getChat(configs.TGBotTest),
    MCBot.getChat(configs.TestServer)
);
console.info("started!");