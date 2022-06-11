const { Matrix } = require("ml-matrix");

const Data = require("../dataModel.js");
const Index = require("../indexModel.js");

const alpha = 0.1;
const threshold = 0.0001;

let _idArr;
async function surfer() {
  const docs = await Data.find();
  const dataSize = await Data.countDocuments();
  let arr_ = [];
  _idArr = [];
  await docs.forEach(async (doc, index) => {
    let row = [];
    let adjNode = 0;
    _idArr.push(doc.id);

    await docs.forEach((_doc, _index) => {
      if (doc.outgoingLinks.includes(_doc.url)) {
        ++adjNode;
        row[_index] = 1;
      } else {
        row[_index] = 0;
      }
    });
    for (let i = 0; i < dataSize; ++i) {
      if (row[i] == 1) row[i] = 1 / adjNode;
      else if (adjNode == 0) row[i] = 1 / dataSize;
    }
    arr_[index] = row;
  });
  return new Matrix(arr_).mul(1 - alpha);
}

async function pageRankCalc() {
  let matrix = await surfer();
  let _alphaArr = Array(matrix.columns).fill(alpha / matrix.rows);
  let alphaArr = Array(matrix.rows).fill(_alphaArr);
  let alphaMatrix = matrix.add(new Matrix(alphaArr));

  let arr = Array(alphaMatrix.columns).fill(1 / alphaMatrix.columns);

  let _matrix = new Matrix([arr]);
  let __matrix = new Matrix([arr]);
  let sigma;
  do {
    __matrix = __matrix.mmul(alphaMatrix);

    for (let i = 0; i < arr.columns; ++i) {
      sigma += Math.abs(_arr.get(0, i) - _matrix.get(0, i));
    }
  } while (threshold < sigma);

  _idArr.forEach(async (id, index) => {
    await Index.updateOne({ id: id }, { pageRank: __matrix.get(0, index) });
  });
}
exports.pageRank = pageRankCalc;
