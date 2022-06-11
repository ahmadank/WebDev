var express = require("express");
var router = express.Router();

const fs = require("fs");
test("test5.txt");

function test(fileName) {
  fs.readFile(fileName, "utf8", async function (err, text) {
    text = text.split("\n");
    let matrix = new Array([]);
    text.shift();
    text.forEach((element, index) => {
      if (element) {
        let tmp2 = element.split(" ");
        tmp2 = tmp2.filter(Boolean);
        matrix[index] = tmp2;
      }
    });
    let user1 = matrix[0].indexOf("User1");
    items = matrix[1];

    matrix.shift();
    matrix.shift();
    let listofLiked = new Array();
    matrix.forEach((row, i) => {
      row.forEach((rating, index) => {
        if (rating == 1)
          listofLiked[i]
            ? listofLiked[i].push(index)
            : (listofLiked[i] = [index]);
      });
    });
    let matchingUsersArr = []; //[UserIndex, [item, paths], [item2, pathsFor Item2]]
    if (listofLiked[user1]) {
      matrix.forEach((row, userNumber) => {
        //for each row
        if (userNumber != user1 && listofLiked[userNumber]) {
          listofLiked[user1].forEach(async (likedIndex) => {
            //check if they have a matching liked item
            if (row[likedIndex] == 1)
              matchingUsersArr.push(listofLiked[userNumber]);
          });
        }
      });
      matchingUsersArr = matchingUsersArr.flat();
      listofLiked[user1].forEach(
        (likedIndex) =>
          (matchingUsersArr = matchingUsersArr.filter(
            (curr) => curr !== likedIndex
          ))
      );
      let count;
      let set = new Set();
      let recommendations = new Array();
      for (let i = 0; i < matchingUsersArr.length; ++i) {
        if (!set.has(matchingUsersArr[i])) {
          set.add(matchingUsersArr[i]);
          count = matchingUsersArr.filter(
            (curr) => curr == matchingUsersArr[i]
          ).length;
          recommendations.push([
            count,
            items[matchingUsersArr[i]] + "(" + count + ")",
          ]);
        }
      }
      recommendations.sort((object1, object2) => object2[0] - object1[0]);
      recommendations.forEach((object) => {
        console.log(object[1]);
      });
    }
  });
}
module.exports = router;
