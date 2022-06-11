const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let productSchema = Schema({
  id: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  outgoingLinks: [
    {
      type: String,
    },
  ],
  incomingLinks: [
    {
      type: String,
    },
  ],
  data: {
    type: String,
  },
});

module.exports = mongoose.model("personal", productSchema);
