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
        chatOne.setAttachmentMessageCallBack(function (message, senderInfo, attachment) {
            chatTwo.sendMessageWithAttachment("[" + senderInfo.name + "] " + message,attachment);
        });
        chatTwo.setAttachmentMessageCallBack(function (message, senderInfo, attachment) {
            chatOne.sendMessageWithAttachment("[" + senderInfo.name + "] " + message,attachment);
        });
    }

    addThreeWayBridge(chatOne, chatTwo, chatThree) {
        this.addThreeWayBridge(chatOne, chatTwo, chatThree, false);
    }

    addThreeWayBridge(chatOne, chatTwo, chatThree, logging) {
        chatOne.setMessageCallBack(function(message, senderInfo) {
            if (logging)
                console.log("["+senderInfo.name+"] " + message);
            chatTwo.sendMessage("["+senderInfo.name+"] " + message);
            chatThree.sendMessage("["+senderInfo.name+"] " + message);
        });
        chatTwo.setMessageCallBack(function(message, senderInfo) {
            if (logging)
                console.log("["+senderInfo.name+"] " + message);
            chatOne.sendMessage("[" + senderInfo.name + "] " + message);
            chatThree.sendMessage("["+senderInfo.name+"] " + message);
        });
        chatThree.setMessageCallBack(function(message, senderInfo) {
            if (logging)
                console.log("["+senderInfo.name+"] " + message);
            chatOne.sendMessage("[" + senderInfo.name + "] " + message);
            chatTwo.sendMessage("["+senderInfo.name+"] " + message);
        });
    }
}

module.exports.Core = Core;