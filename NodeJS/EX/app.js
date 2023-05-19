const express = require('express');
const dotenv = require("dotenv");

const app = express();
dotenv.config();

const dbRouter = require('./routes/db.js');
const fileRouter = require('./routes/file.js');
app.set('port', process.env.LISTENPORT);

app.use('/db', dbRouter);
app.use('/file', fileRouter);
console.log(process.env.LISTENPORT);

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '포트 기동');
 });
 