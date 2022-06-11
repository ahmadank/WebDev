var express = require("express");
var router = express.Router();

const crawler = require("../crawlers/personalCrawler.js");
const search = require("../index/personalSearch.js");
const IndexModel = require("../personalSearch.js");
const pageRank = require("../index/personalPageRank.js");
pageRank.pageRank();
const Data = require("../personalModel.js");
init();
async function init() {
  await Data.deleteMany();
  console.log("Just deleted many");
  crawler.c.queue("https://scrapeme.live/shop/Bulbasaur/");
}

router.get("/", (req, res) => {
  if (crawler.dataCompleted == undefined || crawler.dataCompleted == false)
    res.render("pages/loading");
  else if (crawler.dataCompleted) {
    res.render("pages/personalSearch");
  }
});

router.get("/:id", async (req, res) => {
  let personal = await Data.findOne({ id: req.params.id });
  let personalIndex = await IndexModel.findOne({ id: req.params.id });

  console.log(personalIndex);
  if (personal == null) res.status(404);
  else {
    console.log(personal);
    res.render("pages/personal", {
      personal: personal,
      index: personalIndex,
    });
  }
});

router.post("/", async (req, res) => {
  await search.clear;
  await search.search(req, res);
});

module.exports = router;
