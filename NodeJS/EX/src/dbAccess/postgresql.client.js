const { Pool } = require('pg');
const dotenv = require("dotenv");
const { ConvertJsonToKeyValueObject } = require("../common/utils.js");
dotenv.config();

class postgreSqlClient {

    constructor() {

        this.pool = new Pool({
            user: process.env.DBUSER,
            host: process.env.DBHOST,
            database: process.env.DBNAME,
            password: process.env.DBPASSWORD,
            port: process.env.DBPORT
        })

    }

    async request(spName, params) {
        var strParams = "(";
        if (params) {

            for (var i = 0; i < params.length; i++) {
                strParams += (i == 0 ? "" : ",") + "$" + (i + 1);
            }
        }
        strParams += ")";
        var cmd = {
            text: 'SELECT * FROM ' + spName + strParams,
            values: params
        }


        var result = await this.pool.query(cmd);

        

        return result;

    }



    async dataset(spName, params) {
        var result = await this.request(spName, params);

        var obj = new Object;
        obj.result = null;
        if (result && result.rows)
            obj.result = result.rows;

        return obj;

    }
    async datatable(spName, params) {
        var result = await this.request(spName, params);

        var obj = new Object;
        obj.result = null;
        if (result && result.rows)
            obj.result = result.rows;

        return obj;

    }

    async execute(spName, params) {
        var result = await this.request(spName, params);

        var obj = new Object;
        obj.result = false;
        if (result && result.rowCount) {
            obj.result = result.rowCount > 0
        }
        return obj;

    }

    async scalar(spName, params) {
        var result = await this.request(spName, params);

        var obj = new Object;
        obj.result = null;
        if (result && result.rows && result.rows.length > 0) {

            var row = result.rows[0]
            var s = ConvertJsonToKeyValueObject(row);
            if (s && s.length > 0) {
                obj.result = s[0].value;
            }

        }

        return obj;
    }

}

module.exports = postgreSqlClient