const {Core} = require("./core/Core");
const {VK} = require("./core/modules/VK");
const {TG} = require("./core/modules/TG");
const {DS} = require("./core/modules/DS");
const configs = require("./configs");

core = new Core();
core.addTwoWayModuleBridge(new VK(configs.VKTest),new DS(configs.DSCommands));
console.info("started!");