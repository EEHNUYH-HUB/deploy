const express = require("express");
const { v4 } = require("uuid");
const app = express();
const port = 5000;
const id = v4();
app.get("/", (req, res) => {

    res.send("하이");
})
app.get("/paramtest/:test1", (req, res) => {
    const { test1 } = req.params;
    const { test2 } = req.query;

    res.send(test1 + "<br />" + test2);

})
app.get("/:ms", (req, res) => {
    const { ms } = req.params;
    var start = new Date();
    const wakeUpTime = Date.now() + parseInt(ms);
    while (Date.now() < wakeUpTime) {

    }
    var end = new Date();
    var str = `안녕하세요. <br />ID : ${id} 
     <br /> 시작:${start.getMinutes()}분 ${start.getSeconds()}초
     <br /> 종료:${end.getMinutes()}분 ${end.getSeconds()}초`
    res.send(str);
});

app.listen(port, () => {
    console.log(`환영 합니다. http://localhost:${port} `);
});
