var express = require("express");
var path = require("path");

var router = require("./routes/calculation");

var app = express();
const port = 3000
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));
app.use("/", router);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
})