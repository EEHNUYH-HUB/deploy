const express = require("express");
const { Pool } = require('pg');
const dotenv = require("dotenv");
dotenv.config();
const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DBNAME,
  password: process.env.DBPASSWORD,
  port: process.env.DBPORT
})

const app = express();
const port = 6000;

app.get("/:cnt", async (req, res) => {

   
    const add_sql = 'SELECT * FROM TBL_MEMBER';

   const{rows} = await pool.query(add_sql, null);
    
   res.send(rows);
    
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
