const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let orderSchema = Schema({
	buyer: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	nameOfBuyer: {
		type: String
	},
	restaurantID: {
		type: Number
	},
	restaurantName: {
		type: String
	},
	subtotal: {
		type: Number
	},
	total: {
		type: Number
	},
	fee: {
		type: Number
	},
	tax: {
		type: Number
	},
	order: {
		type: Object
	}
});

module.exports = mongoose.model("Orders", orderSchema);