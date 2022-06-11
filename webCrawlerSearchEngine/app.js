var express = require("express");
var path = require("path");

const mongoose = require("mongoose");

var app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

app.get("/", (req, res) => res.render("pages/Index"));
app.use("/fruits", require("./routes/fruits.js"));
app.use("/personal", require("./routes/personal.js"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://localhost/A1", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  app.listen(3000);
  console.log("Server listening on port 3000");
});
