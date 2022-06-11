const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let productSchema = Schema({
  id: {
    type: String,
    required: true,
  },
  pageRank: {
    type: Number,
  },
  tempScore: {
    type: Number,
  },
});

module.exports = mongoose.model("personalIndex", productSchema);
