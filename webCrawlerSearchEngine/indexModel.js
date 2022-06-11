const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let productSchema = Schema({
  id: {
    type: String,
    required: true,
  },
  tempScore:{
    type: Number,
  },
  pageRank:{
    type:Number,
  },
  boost:{
    type:Number,
  },
  query: [
    {
      text:{
        type: String,
      },
      count:{
        type: Number,
      },
    },
  ],
});

module.exports = mongoose.model("index", productSchema);
