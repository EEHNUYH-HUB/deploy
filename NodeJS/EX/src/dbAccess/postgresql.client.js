const { Pool } = require('pg');
const dotenv = require("dotenv");
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

    async fill(spName, params) {
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


        return await this.pool.query(cmd);
        //return rows;

    }
    excute() {

    }

    scalar() {

    }

}

module.exports = postgreSqlClient