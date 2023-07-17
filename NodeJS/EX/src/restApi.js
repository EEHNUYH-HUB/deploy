const express = require('express');
var bodyParser = require('body-parser');


const app = express();
const dotenv = require("dotenv");
dotenv.config();

const dynamicApi = require('./controllers/dynamic.db.controller.js');


app.set('port', process.env.APIPORT);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/dynamic', dynamicApi);

app.listen(app.get('port'), () => {
    console.log(`환영 합니다. http://localhost:${app.get('port')} `);
});
