class ProxyService {
    static getAddress(number,tryi) {
        switch (number) {
            case 1:
                return "https://gimmeproxy.com/api/getProxy?protocol=http";
            case 2:
                return "https://api.getproxylist.com/proxy?protocol=http";
            case 3:
                return "http://api.foxtools.ru/v2/Proxy?type=1&available=1&free=1&limit=1&country=US";
            case 4:
                return "https://htmlweb.ru/json/proxy/get?perpage=1&country_not=RU,UA&p="+tryi;
            case 5:
                return "https://api.proxyscrape.com?request=getproxies&proxytype=http&timeout=5000&country=US&anonymity=elite&limit=1";
            case 6:
                return "http://pubproxy.com/api/proxy?type=http";
        }
    }

    static parseBody(number,body) {
        switch (number) {
            case 1:
                return body.ipPort;
            case 2:
                return body.ip+":"+body.port;
            case 3:
                return body.response.items[0].ip+":"+body.response.items[0].port;
            case 4:
                return body[0].name;
            case 5:
                return body;
            case 6:
                return body.data[0].ipPort;
        }
    }
}

module.exports.ProxyService = ProxyService;