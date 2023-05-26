const express = require("express");
const { Worker } = require('worker_threads');
const app = express();
const port = 5002;

app.get("/:ms", (req, res) => {
    const { ms } = req.params;

    const worker = new Worker("./child.js");
    var childMessage;
    worker.on('message', message => childMessage = message);

    worker.on('exit', () => {
        res.send(childMessage);
    });
    worker.postMessage(ms);
});

app.listen(port, () => {
    console.log(`환영 합니다. http://localhost:${port} `);
});
