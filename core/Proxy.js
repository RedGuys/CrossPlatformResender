const request = require("request");
const {ProxyService} = require("./ProxyService");
const proxyListService = 5;

class Proxy {
    static lastProxy = "";
    static tryi = 0;

    static async getProxy(callback) {
        Proxy.tryi++;
        if(Proxy.lastProxy !== "") {
            callback(this.lastProxy);
            return;
        }
        let promise = new Promise((callback, retry) => {
            console.log("Getting proxy from server");
            request(ProxyService.getAddress(proxyListService,Proxy.tryi), {json: true}, (err, req,body) => {
                if(err) {
                    console.log(err);
                    retry(callback);
                }
                let ip = ProxyService.parseBody(proxyListService,body);
                console.log("Testing proxy");
                request({
                        'url': 'https://api.telegram.org/bot513263491:AAENuSRO00tTKQAq3AO3ETu6nf7QLHkwnZU/sendMessage?text=Hi&chat_id=159619537',
                        'method': "GET",
                        'proxy': "http://" + ip
                    }, function (error, response, resBody) {
                    if(response !== undefined) {
                        if (!error && response.statusCode === 200) {
                                console.log("Finded");
                                Proxy.lastProxy = ip;
                                callback(ip);
                        } else {
                            console.log(error);
                            retry(callback);
                        }
                    } else {
                        console.log(error);
                        retry(callback);
                    }
                    });
            });
        });

        promise.then(callback,Proxy.getProxy);
    }
}

module.exports = Proxy;