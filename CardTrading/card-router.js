
// ====================================================== //
// ==================== Node modules ==================== //
// ====================================================== //
const mongoose = require("mongoose");
const express = require('express');
// ====================================================== //
// ==================== Schemas Used ==================== //
// ====================================================== //
const ObjectId = require('mongoose').Types.ObjectId;

// ~~~~~~~~~~ creating a router ~~~~~~~~~~ //
let router = express.Router();

// ~~~~ converts a string to an object ~~~ //
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
	extended: false
}));
router.use(bodyParser.json());

//if a user requests a singleOrder get the id for that order 
router.get("/:rid", card);
// ====================================================== //
//  Card Router Sends the Information about that specifc card  //
// ====================================================== //
function card(req, res) {
	let id = req.params.rid;
	//looks in the orders collection for an order that has the object representation of the id given
	mongoose.connection.db.collection("cards").findOne({
		_id: new ObjectId(id)
	}, function (err, result) {
		//throw the user the error if error was found
		if (err) throw err;
		//if there was a order with the id given
		if (result) {
			res.render("pages/card", {
				result: result,
				user: req.session
			});
		}else {
			//if the order was not found display that the order was not found
			res.status(404).send("Order Not Found <a href=/>Click me To Go Home</a>");
		}
	});
}
module.exports = router;