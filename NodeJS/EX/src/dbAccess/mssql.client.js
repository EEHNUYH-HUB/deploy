const sql = require('mssql');
const dotenv = require("dotenv");
dotenv.config();

class msSqlClient {

    constructor() {

        this.pool = new sql.ConnectionPool({
            user: process.env.DBUSER,
            server: process.env.DBHOST,
            database: process.env.DBNAME,
            password: process.env.DBPASSWORD,
            options: {
                encrypt: false,
                enableArithAbort: true
            },
        }).connect().then(pool => {
            console.log("Connected to Ms-SQL")
            return pool;
        }).catch(err => console.log('Database Connection Failed! Bad Config: ', err))
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

module.exports = msSqlClient