const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let productSchema = Schema({
	username: {
		type: String, 
		required: [true," You need a username in order to register."],
		minlength: 1,
	},
	password: {
		type: String,
		required: [true, "You need a password in order to register."],
		min: [1]
	},
	privacy:{
		type: Boolean,
        default: false
	}
});


module.exports = mongoose.model("users", productSchema);
