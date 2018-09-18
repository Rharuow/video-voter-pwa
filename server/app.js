const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes.js");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


routes(app);

const server = app.listen(3000, () => {
    console.log("App running on port:", server.address().port);
});