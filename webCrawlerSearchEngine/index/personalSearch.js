const elasticlunr = require("elasticlunr");

const Data = require("../personalModel.js");
const personalIndex = require("../personalSearch.js");

const clear = personalIndex.updateMany({}, { tempScore: 0, boost: 0 });

async function indexing() {
  return (index = elasticlunr(function () {
    this.addField("text");
    this.setRef("id");
  }));
}
async function getDocumentsData() {
  const docs = await Data.find();
  await docs.forEach(async (doc) => {
    try {
      if (doc.id && !doc.id.includes("£") && doc.outgoingLinks.length > 0) {
        await index.addDoc({
          text: doc.data.replace(/(\n)/gm, " "),
          id: doc.id,
        });
      }
    } catch (err) {
      console.log("Err");
    }
  });
}

async function search(req, res) {
  var index = await indexing();
  let results = [];
  await getDocumentsData();
  let arr = req.body.search.split(" ");
  await arr.forEach(async (query) => {
    tmp = await index.search(query, {});
    results.push({ query: query, index: tmp });
  });
  results.forEach(async (result) => {
    await result.index.forEach(async (index) => {
      await personalIndex.updateOne(
        { id: index.ref },
        { $inc: { tempScore: index.score } },
        { upsert: true }
      );
    });
  });
  let num = Number(req.body.entries);
  let tmp1;
  !isNaN(num) && num > 0 && num <= 50 ? (num = num) : (num = 10);
  if (req.body.checkBoost == "true") {
    dataModel = await personalIndex.find({});
    await dataModel.forEach(async (doc) => {
      await doc.updateOne({ boost: doc.pageRank * doc.tempScore });
    });
    tmp1 = await personalIndex
      .find({ pageRank: { $gt: 0 } })
      .sort({ boost: -1 })
      .limit(num);
  } else {
    tmp1 = await personalIndex
      .find({ pageRank: { $gt: 0 } })
      .sort({ tempScore: -1 })
      .limit(num);
  }
  res.render("pages/personalSearch", {
    search: arr,
    results: tmp1,
  });
}

exports.clear = clear;
exports.search = search;
