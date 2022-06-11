const Data = require("../dataModel.js");
const Index = require("../indexModel.js");

const search = require("../index/search.js");
const pageRank = require("../index/pageRank.js");

init();
async function init() {
  await Index.deleteMany();
}

pageRank.pageRank();

const IndexList = async function () {
  const docs = await Data.find();
  await docs.forEach((doc) => {
    try {
      Index.findOne(
        {
          id: doc.id,
        },
        async function (err, result) {
          if (result) console.log("found");
          else {
            try {
              if (doc.data == undefined) console.log("Empty data");
              else {
                let dataArr = doc.data.replace(/(\n)/gm, " ");
                dataArr = dataArr.split(" ");
                let keyWords = [];
                let sort = new Promise(async (resolve) => {
                  for (let i = 0; i < dataArr.length; ++i) {
                    let keyword = dataArr[i];
                    if (!keyWords.includes(keyword)) {
                      let count = 0;
                      keyWords.push(keyword);
                      for (let j = i; j < dataArr.length; ++j) {
                        if (dataArr[j] == keyword) ++count;
                      }
                      await Index.updateOne(
                        { id: doc.id },
                        {
                          $push: {
                            query: {
                              text: keyword.toString(),
                              count: count,
                            },
                          },
                        },
                        { upsert: true }
                      );
                    }
                    if (i == dataArr.length - 1) resolve();
                  }
                });
                await sort;
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
      );
    } catch (err) {
      console.log(doc);
    }
  });
};
exports.IndexList = IndexList;
