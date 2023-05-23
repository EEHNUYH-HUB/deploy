const express = require('express');
const dotenv = require("dotenv");
var bodyParser = require('body-parser');
const app = express();
dotenv.config();

const dbRouter = require('./routes/db.js');
const fileRouter = require('./routes/file.js');
const dynamicApi = require('./src/controllers/dynamic.db.controller.js');

app.set('port', process.env.LISTENPORT);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', dbRouter);
app.use('/', fileRouter);
app.use('/dynamic', dynamicApi);



app.listen(app.get('port'), () => {
    console.log(app.get('port'), '포트 기동');
});
