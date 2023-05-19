const express = require("express");

const { Worker, parentPort, isMainThread } = require('worker_threads');
const app = express();
const port = 5001;
app.get("/:cnt", (req, res) => {
  var {cnt} = req.params;
  var start = new Date();

  const worker = new Worker("./src/worker/w.js");
  var msg;
  worker.on('message', message => msg = message); // 워커로부터 받은 메시지.
  worker.on('exit', () => {
    var s = "index2 시작:"+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds()
    start = new Date();
    var e =  "종료:"+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds()
    res.send(s+" <br/> "+e +"<br/>");

  });
  worker.postMessage(cnt);

  
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
  