const dotenv = require("dotenv");
const postgreSqlClient = require('./postgresql.client.js');
const msSqlClient = require('./mssql.client.js');
dotenv.config();

const getClient = () => {
    if (process.env.DBTYPE == "POSTGRESQL") {
        return new postgreSqlClient();
    }
    else if (process.env.DBTYPE == "MSSQL") {
        return new msSqlClient();
    }
    else {
        return;
    }

}

module.exports = { getClient };