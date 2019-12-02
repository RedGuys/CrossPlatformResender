process.env["NTBA_FIX_319"] = 1;
//Includes {
const config = require("./configs");

const mysql = require("mysql2");
let MySQLConnection = null;

const Agent = require('socks5-https-client/lib/Agent');
const TGBotLib = require('node-telegram-bot-api');
let TGBot = null;

//Includes }

Init();

function StopServer() {
    MySQLConnection.end();
}

function Init() {
    InitMysql();
    if(config.EnableTelegram) {
        InitTelegramm();
        TGListeners();
    }
}

function InitMysql() {
    MySQLConnection = mysql.createConnection({
        host: config.mysql_host,
        user: config.mysql_user,
        database: config.mysql_daba,
        password: config.mysql_pass
    });
    MySQLConnection.connect(function(err){
        if (err) {
            console.error("Mysql init error: " + err.message);
            StopServer();
        }
    });
    console.log("MySql inited")
}

function InitTelegramm() {
    if(config.TG_NeedProxy) {
        if(config.TG_ProxyType == 2) {
            TGBot = new TGBotLib(config.TG_Token, {
                polling: true, request: {
                    agentClass: Agent,
                    agentOptions: {
                        socksHost: config.TG_Proxy_Socks5_host,
                        socksPort: config.TG_Proxy_Socks5_port
                    }
                }
            });
        } else if(config.TG_ProxyType == 1) {
            TGBot = new TGBotLib(config.TG_Token, {
                polling: true, request: {proxy: config.TG_Proxy_Http_host}
            });
        }
    } else {
        TGBot = new TGBotLib(config.TG_Token, {polling: true});
    }
    console.log("TG inited")
}

//TODO: VK bot

//TODO: Discord bot

//TODO: FaceBook bot

//TODO: TamTam

//TODO: viber bot
//Init }

//Workers {
function TGListeners() {
    TGBot.on('polling_error', (error) => {
        if(config.TG_LogProxyError) {
            console.log(error);
        }
    });

    TGBot.on('message', (msg) => {
        console.log('new messsage');
        const chatId = msg.chat.id;
        const text = msg.text;
        if(text.startsWith("/cpf")) {
            const args = text.substr(5).split(" ");
            if(args[0] === "list") {
                MySQLConnection.execute("SELECT * FROM  `telegramgroups` WHERE  `SocalId` = '" + chatId + "' LIMIT 0 , 1", function (err, results) {
                    if (err) console.log(err);
                    const groups = results;
                    if (groups.length == 0) {
                        TGBot.sendMessage(chatId, "Chat not registred, register chat via run /cpf init");
                    }
                });
            } else {

            }
        }
        TGBot.sendMessage(chatId, 'Received your message');
    });
}

//TODO: VK bot

//TODO: Discord bot

//TODO: FaceBook bot

//TODO: TamTam

//TODO: viber bot
//Workers }