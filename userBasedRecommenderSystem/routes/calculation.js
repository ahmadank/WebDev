var express = require("express");
var router = express.Router();

const fs = require("fs");

test("test3.txt");

function test(fileName) {
  fs.readFile(fileName, "utf8", async function (err, text) {
    text = text.split("\n");
    let tmp = text[0].split(" ");
    let numOfUsers = Number(tmp[0]);
    let numOfItems = Number(tmp[1]);
    let estimate = new Array(numOfItems);
    let tmpArr = new Array([]);
    let names;
    let items;
    text.shift();
    text.forEach((element, index) => {
      if (element) {
        let tmp2 = element.split(" ");
        tmp2 = tmp2.filter(Boolean);
        tmpArr[index] = tmp2;
      }
    });
    names = tmpArr[0];
    items = tmpArr[1];
    tmpArr.shift();
    tmpArr.shift();
    arrayOfAvg = new Array(numOfUsers);
    let unknown = true;
    while (unknown) {
      tmpArr.forEach((row, rowNum) => {
        let sum = 0;
        let numOfKnown = 0;
        row.forEach((column, numOfColoumn) => {
          if (column != -1) {
            sum += Number(column);
            ++numOfKnown;
          }
          if (numOfColoumn == numOfItems - 1) {
            arrayOfAvg[rowNum] = sum / numOfKnown;
          }
        });
      });

      tmpArr.forEach((row, rowNum) => {
        let confidence = new Array(numOfUsers);
        if (row.includes("-1")) {
          for (let i = 0; i < numOfUsers; ++i) {
            let bottomLeft = 0;
            let bottomRight = 0;
            let correlation = 0;
            if (i != rowNum) {
              tmpArr[i].forEach((column, colNum) => {
                if (column != -1 && row[colNum] != -1) {
                  correlation +=
                    Number(row[colNum] - arrayOfAvg[rowNum]) *
                    (Number(column) - arrayOfAvg[i]);
                  bottomLeft +=
                    Number(row[colNum] - arrayOfAvg[rowNum]) *
                    (Number(row[colNum]) - arrayOfAvg[rowNum]);
                  bottomRight +=
                    (Number(column) - arrayOfAvg[i]) *
                    (Number(column) - arrayOfAvg[i]);
                }
              });
              confidence[i] =
                correlation / (Math.sqrt(bottomRight) * Math.sqrt(bottomLeft));
            }
          }
          let low1;
          let low2;
          for (let i = 0; i < numOfItems; ++i) {
            if (confidence[i]) {
              if (low1 == null) low1 = confidence[i];
              if (confidence[i] > low1) low1 = confidence[i];
            }
          }
          for (let i = 0; i < numOfItems; ++i) {
            if (confidence[i] && confidence[i] != low1) {
              if (low2 == null) low2 = confidence[i];
              if (confidence[i] > low2) low2 = confidence[i];
            }
          }
          low1 = confidence.indexOf(low1);
          low2 = confidence.indexOf(low2);
          estimate[rowNum] =
            arrayOfAvg[rowNum] +
            (confidence[low1] *
              (Number(tmpArr[low1][row.indexOf("-1")]) - arrayOfAvg[low1]) +
              confidence[low2] *
                (Number(tmpArr[low2][row.indexOf("-1")]) - arrayOfAvg[low2])) /
              (confidence[low1] + confidence[low2]);
        }
      });

      tmpArr.forEach((row, rowNum) => {
        if (row.indexOf("-1") >= 0)
          row[row.indexOf("-1")] = estimate[rowNum].toFixed(2);
      });
      for (let i = 0; i < numOfUsers; ++i) {
        if (tmpArr[i].includes("-1")) {
          unknown = true;
          break;
        }
        unknown = false;
      }
    }
    tmpArr.forEach((row) => {
      row.push("\n");
    });
    let writing =
      " " +
      numOfUsers +
      " " +
      numOfItems +
      "\n " +
      names +
      "\n " +
      items +
      "\n " +
      tmpArr.toString().replace(/,/g, " ");
    fs.writeFile("NEWTEXT.txt", writing, function (err, result) {
      if (err) console.log("error", err);
    });
  });
}

module.exports = router;
