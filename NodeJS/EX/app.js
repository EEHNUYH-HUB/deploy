const express = require('express');
const dotenv = require("dotenv");
var bodyParser = require('body-parser');
const app = express();
dotenv.config();

const dynamicApi = require('./src/controllers/dynamic.db.controller.js');

app.set('port', process.env.LISTENPORT);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/dynamic', dynamicApi);

app.listen(app.get('port'), () => {
    console.log(`환영 합니다. http://localhost:${app.get('port')} `);
});
