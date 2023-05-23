const express = require("express");

const app = express();
const port = 5000;

app.get("/:cnt", (req, res) => {
  var {cnt} = req.params;
  
  var start = new Date();
  const wakeUpTime = Date.now() + cnt*1;
    
  while (Date.now() < wakeUpTime) {


  }

  var s = "index1  시작:"+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds()
  start = new Date();
  var e =  "종료:"+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds()
  res.send(s+" <br/> "+e +"<br/>");

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
