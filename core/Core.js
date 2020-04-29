class Core {
    constructor() {
    }

    addTwoWayBridge(chatOne, chatTwo) {
        this.addTwoWayBridge(chatOne, chatTwo, false);
    }

    addTwoWayBridge(chatOne, chatTwo, logging) {
        chatOne.setMessageCallBack(function(message, senderInfo) {
            if (logging)
                console.log("["+senderInfo.name+"] " + message);
            chatTwo.sendMessage("["+senderInfo.name+"] " + message);
        });
        chatTwo.setMessageCallBack(function(message, senderInfo) {
            if (logging)
                console.log("["+senderInfo.name+"] " + message);
            chatOne.sendMessage("[" + senderInfo.name + "] " + message);
        });
    }
}

module.exports.Core = Core;