const mysqlDriver = require("mysql2");
const {BaseModule} = require("./classes/BaseModule");

class MySQL extends BaseModule {
    mysqlConn;
    /**
     *
     * @param config array with host, user, password, base, port params
     */
    constructor(config) {
        super(config);
        if(!config.port) {
            config.port = 3306;
        }
        this.mysqlConn = mysqlDriver.createConnection({
            host: config.host,
            user: config.user,
            database: config.database,
            password: config.password,
            port: config.port
        });
    }

    connect() {
        super.connect();
        this.mysqlConn.connect();
    }
}

module.exports.MySQL = MySQL;