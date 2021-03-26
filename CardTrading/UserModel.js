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
	cards:{
		type:Object
	},
	friends:{
		userid:{
			type: Schema.Types.ObjectId,
			ref: 'User',
			},
		user:{
			type:String
		}
	},
	friendreq:{
		userid:{
		type: Schema.Types.ObjectId,
		ref: 'User',
		},
		user:{
			type:String
		}
	},
	tradereq:{
		tradeInit:{
			type: String
		},
		tradeId:{
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		userTradingWith:{
			type:String
		},
		userid:{
			type: Schema.Types.ObjectId,
			ref: 'User',
			},
		cardGivenId:{
			type: Object
		},
		cardTakenId:{
			type: Object
		}
	}
});


module.exports = mongoose.model("users", productSchema);
