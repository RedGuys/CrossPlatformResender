class Core {
    constructor() {
    }

    addTwoWayBridge(chatOne, chatTwo) {
        chatOne.setMessageCallBack(function(message, senderInfo) {
                chatTwo.sendMessage("["+senderInfo.name+"] " + message);
        });
        chatTwo.setMessageCallBack(function(message, senderInfo) {
            chatOne.sendMessage("[" + senderInfo.name + "] " + message);
        });
    }
}

module.exports.Core = Core;