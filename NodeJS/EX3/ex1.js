const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
    res.send("안녕하세요 감사합니다 고맙습니다");
});

app.get("/api", (req, res) => {
    res.send("api 페이지 입니다. ");
});

app.get("/:cnt", (req, res) => {
    const { cnt } = req.params;
    const { test } = req.query;
    res.send(`${cnt},${test}`);
});

app.listen(port, () => {
    console.log(`환영 합니다. http://localhost:${port}`);
})
