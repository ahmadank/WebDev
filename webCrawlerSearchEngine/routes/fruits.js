var express = require("express");
var router = express.Router();
const elasticlunr = require("elasticlunr");

const crawler = require("../crawlers/crawler.js");
const search = require("../index/search.js");

const Data = require("../dataModel.js");
const Index = require("../indexModel.js");

init();
async function init() {
  await Data.deleteMany();
  console.log("Just deleted many");
  crawler.c.queue(
    "https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html"
  );
}

router.get("/", (req, res) => {
  if (crawler.dataCompleted == undefined || crawler.dataCompleted == false)
    res.render("pages/loading");
  else if (crawler.dataCompleted) {
    res.render("pages/fruitsSearch");
  }
});

router.get("/:id", async (req, res) => {
  let fruit = await Data.findOne({ id: req.params.id });
  let index = await Index.findOne({ id: req.params.id });
  if (fruit == null) res.status(404);
  else {
    res.render("pages/fruit", {
      fruit: fruit,
      index: index,
    });
  }
});

router.post("/", async (req, res) => {
  await search.clear;
  await search.search(req, res);
});

module.exports = router;
