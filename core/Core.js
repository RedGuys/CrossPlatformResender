class Core {
    constructor() {
    }

    addTwoWayModuleBridge(moduleOne, moduleTwo) {
        moduleOne.SetMessageCallBack(function(message, senderInfo) {
            moduleTwo.sendMessage("["+senderInfo.name+"] "+message);
        });
        moduleTwo.SetMessageCallBack(function(message, senderInfo) {
            moduleOne.sendMessage("["+senderInfo.name+"] "+message);
        });
    }
}

module.exports.Core = Core;