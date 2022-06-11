const Crawler = require("crawler");
const Data = require("../personalModel.js");

let dataCompleted = false;

let queue = [];
let count = 0;
const c = new Crawler({
  maxConnections: 10,
  callback: async (error, res, done) => {
    ++count;
    let title;
    if (error) throw error;
    let $ = res.$;
    let links = $("a");
    $(links).each(async function (i, link) {
      if ($(link).attr("href") != undefined)
        if (
          $(link).attr("href").indexOf(" ") < 0 &&
          $(link).attr("href").indexOf("https://scrapeme.live/shop") >= 0
        ) {
          title = $(link).text();
          title = title[0] = title.split();
          if (!title.toString().includes("00")) {
            let data = $("p").text();
            queue.push($(link).attr("href"));
            await Data.updateOne(
              { link: res.options.uri },
              {
                $set: {
                  data: data,
                  id: title[0],
                },
                $push: {
                  outgoingLinks: $(link).attr("href"),
                },
              },
              { upsert: true }
            );
            await Data.updateOne(
              { link: $(link).attr("href") },
              {
                $push: {
                  incomingLinks: res.options.uri,
                },
              },
              { upsert: true }
            );
          }
        }
    });
    if (count == 500) queue = [];
    if (queue.length > 0) {
      c.queue(queue[queue.length - 1]);
      queue.pop();
    }
    done();
  },
});

c.on("drain", () => initComplete());

async function initComplete() {
  console.log("Ready");
  dataCompleted = true;
  exports.dataCompleted = dataCompleted;
}

exports.c = c;
