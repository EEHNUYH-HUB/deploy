const sql = require('mssql');
const dotenv = require("dotenv");
const { ConvertJsonToKeyValueObject } = require("../common/utils.js");

dotenv.config();
var config = {
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    server: process.env.DBHOST,
    database: process.env.DBNAME,
    options: {
        encrypt: false,
        enableArithAbort: true
    }
}

class msSqlClient {

    constructor() {
        this.pool = new sql.ConnectionPool(config);
        this.isConnected = false;
    }

    async connect() {
        if (!this.isConnected) {
            try {
                await this.pool.connect();
                console.log("Connected to Ms-SQL")
                this.isConnected = true;
            }
            catch (ex) {
                this.isConnected = false;
                this.pool = null;
                console.log('Database Connection Failed! Bad Config: ', err)
                return null;
            }
        }

        return this.pool

    }
    async request(spName, params) {
        await this.connect();
        const rqt = await this.pool.request()
        if (params) {
            var keyValue = (ConvertJsonToKeyValueObject(params))
            if (keyValue) {
                for (var i in keyValue) {
                    var v = keyValue[i];
                    rqt.input(v.key, v.value)
                }
            }
        }
        var r = await rqt.execute(spName);

        return r;
    }
    async dataset(spName, params) {
        var result = await this.request(spName, params);

        var obj = new Object;
        obj.result = null;

        if (result && result.recordsets)
            obj.result = result.recordsets;
        return obj;

    }
    async datatable(spName, params) {
        var result = await this.request(spName, params);

        var obj = new Object;
        obj.result = null;
        if (result && result.recordset)
            obj.result = result.recordset;

        return obj;

    }

    async execute(spName, params) {
        var result = await this.request(spName, params);

        var obj = new Object;
        obj.result = false;
        if (result && result.rowsAffected && result.rowsAffected.length > 0) {
            obj.result = result.rowsAffected[0] > 0
        }
        return obj;

    }

    async scalar(spName, params) {
        var result = await this.request(spName, params);

        var obj = new Object;
        obj.result = null;
        if (result) {
            obj.result = result.returnValue;
        }

        return obj;
    }

}

module.exports = msSqlClient