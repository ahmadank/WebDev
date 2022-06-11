const Crawler = require("crawler");
const Data = require("../dataModel.js");
const index = require("../index/index.js");

let dataCompleted = false;
let queue = [];

const c = new Crawler({
  maxConnections: 10,
  callback: async (error, res, done) => {
    let outgoingLinks = [];
    if (error) throw error;
    let $ = res.$;
    let links = $("a");
    let id = $("title").text();
    let data = $("p").text();
    console.log(id);
    await Data.findOne(
      {
        id: id,
      },
      async function (err, result) {
        if (err) console.log(err);
        if (!result) {
          let newData = new Data();
          newData.id = id;
          newData.url = getLink(id);
          newData.data = data;
          await newData.save();
        } else {
          result.data = data;
          result.markModified("incomingLinks");
          await result.save();
        }
      }
    );
    $(links).each(async function (i, link) {
      outgoingLinks.push(getLink($(link).text()));
      await Data.findOne(
        {
          id: $(link).text(),
        },
        async function (err, result) {
          if (err) console.log(err);
          if (!result) {
            let newData = new Data();
            newData.id = $(link).text();
            newData.url = getLink($(link).text());
            newData.incomingLinks = getLink(id);
            await newData.save();
            queue.push(getLink($(link).text()));
          } else {
            try {
              result.incomingLinks.push(getLink(id));
              result.markModified("incomingLinks");hu
              await result.save();
            } catch (err) {
              console.log(err);
            }
          }
        }
      );
    });
    await Data.updateOne({ id: id }, { outgoingLinks: outgoingLinks });
    if (queue.length > 0) {
      c.queue(queue[queue.length - 1]);
      queue.pop();
    }
    done();
  },
});

function getLink(id) {
  return (
    `https://people.scs.carleton.ca/~davidmckenney/fruitgraph/` + id + `.html`
  );
}

c.on("drain", () => initComplete());

async function initComplete() {
  console.log("Ready");
  dataCompleted = true;
  await index.IndexList();
  exports.dataCompleted = dataCompleted;
}

exports.c = c;
