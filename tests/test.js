const htmlNode = require("../index");
const express = require("express");
const app = express();
app.use(htmlNode.callback);

app.get("/", (req, res) => {
    req.sendNode("test", {a: "sa"});
});

app.listen(3000);