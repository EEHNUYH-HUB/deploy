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


const router = express.Router();
router.get('/', async (req, res) => {
  const add_sql = 'SELECT * FROM TBL_MEMBER';
  const { rows } = await pool.query(add_sql, null);
  res.send(rows);
});


router.get('/fc', async (req, res) => {
  try {
    const { fcname, test } = req.query;


    if (test) {
      var cmd = {
        text: 'SELECT * FROM ' + fcname + '($1)',
        values: [test * 1]
      }
    }
    else {
      var cmd = {
        text: 'SELECT * FROM ' + fcname + '()',
        values: []
      }
    }
    console.log(cmd)

    const { rows } = await pool.query(cmd);
    res.send(rows);
  }
  catch (e) {
    res.send(e);
  }
});
router.post('/fc', async (req, res) => {
  try {
    const { fcname, test } = req.query;


    if (test) {
      var cmd = {
        text: 'SELECT * FROM ' + fcname + '($1)',
        values: [test * 1]
      }
    }
    else {
      var cmd = {
        text: 'SELECT * FROM ' + fcname + '()',
        values: []
      }
    }
    console.log(cmd)

    const { rows } = await pool.query(cmd);
    res.send("POST" + rows);
  }
  catch (e) {
    res.send(e);
  }
});

router.get('/TEST/:cnt', async (req, res) => {
  const { cnt } = req.params;
  var start = new Date();


  await test(cnt);


  var s = "index1  시작:" + start.getHours() + ":" + start.getMinutes() + ":" + start.getSeconds()
  start = new Date();
  var e = "종료:" + start.getHours() + ":" + start.getMinutes() + ":" + start.getSeconds()
  res.send(s + " <br/> " + e + "<br/>");
});


const test = async (cnt) => {

  const add_sql = 'SELECT pg_sleep(' + cnt + ')';
  await pool.query(add_sql, null);

}

module.exports = router;
