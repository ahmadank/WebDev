const elasticlunr = require("elasticlunr");

const Data = require("../dataModel.js");
const Index = require("../indexModel.js");

const clear = personalIndex.updateMany({}, { tempScore: 0, boost: 0 });

async function indexing() {
  return (index = elasticlunr(function () {
    this.addField("text");
    this.setRef("id");
  }));
}
async function getDocumentsData() {
  const docs = await Data.find();
  await docs.forEach((doc) => {
    try {
      if (doc.id)
        index.addDoc({ text: doc.data.replace(/(\n)/gm, " "), id: doc.id });
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
      await Index.updateOne(
        { id: index.ref },
        { $inc: { tempScore: index.score } }
      );
    });
  });
  let num = Number(req.body.entries);
  let tmp1;
  !isNaN(num) && num > 0 && num <= 50 ? (num = num) : (num = 10);
  if (req.body.checkBoost == "true") {
    dataModel = await Index.find({});
    await dataModel.forEach(async (doc) => {
      await doc.updateOne({ boost: doc.pageRank * doc.tempScore });
    });
    tmp1 = await Index.find({}).sort({ boost: -1 }).limit(num);
  } else {
    tmp1 = await Index.find({}).sort({ tempScore: -1 }).limit(num);
  }
  res.render("pages/fruitsSearch", {
    search: arr,
    results: tmp1,
  });
}

exports.clear = clear;
exports.search = search;
