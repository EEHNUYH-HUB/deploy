const express = require("express");

const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("TESTPAGE1");
});

app.get("/test", (req, res) => {
  res.send("TESTPAGE2");
});

app.get("/test1", (req, res) => {
  res.send("test1!");
});

app.get("/test2", (req, res) => {
  res.send("tes2t!");
});

app.get("/test3", (req, res) => {
  res.send("3!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
