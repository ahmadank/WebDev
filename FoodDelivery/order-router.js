// ====================================================== //
// ==================== Node modules ==================== //
// ====================================================== //
const mongoose = require("mongoose");
const express = require('express');
// ====================================================== //
// ==================== Schemas Used ==================== //
// ====================================================== //
const nOrder = require("./orderModel");
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
router.get("/:rid", singleOrder);

// ====================================================== //
//  SingleOrder Gets the information of the order specifed 
//				and sends it back to the user 			 //
// ====================================================== //
function singleOrder(req, res) {
	let id = req.params.rid;
	//looks in the orders collection for an order that has the object representation of the id given
	mongoose.connection.db.collection("orders").findOne({
		_id: new ObjectId(id)
	}, function (err, result) {
		//throw the user the error if error was found
		if (err) throw err;
		//if there was a order with the id given
		if (result) {
			//look for who bought this order in the users collection
			mongoose.connection.db.collection("users").findOne({
				username: result.nameOfBuyer
			}, function (e, user) {
				//if error its console logs the error and prints that there was a problem looking for the user
				if (e) {
					console.log(e);
					res.status(500).send("Error reading user.");
					return;
				};
				//if the user does not exist return a 404 error and tell the user that the user with the id does not exists
				if (!user) {
					res.status(404).send("User " + id + " does not exist.");
					return;
				};
				//if the user was found look for his privacy if it is set to not private or 
				//the user is logged in  display the order
				if ((!user.privacy) || ((result.nameOfBuyer == req.session.username) && req.session.loggedin)) {
					res.render("pages/order", {
						result: result,
						user: req.session
					});
				} else {
					//if the user is private and is not logged in display that the order is private
					res.status(403).send("Private Data");
				};
			});
		} else {
			//if the order was not found display that the order was not found
			res.status(404).send("Order Not Found <a href=/>Click me To Go Home</a>");
		}
	});
}

// ====================================================== //
// ============== If an order is being made ============= //
// ====================================================== //
router.post("/", function (req, res) {
	//once that information is recieved create a new order
	var newOrder = new nOrder();
	newOrder.restaurantID = req.body.restaurantID;
	newOrder.restaurantName = req.body.restaurantName;
	newOrder.subtotal = req.body.subtotal.toFixed(2);
	newOrder.total = req.body.total.toFixed(2);
	newOrder.fee = req.body.fee.toFixed(2);
	newOrder.tax = req.body.tax.toFixed(2);
	newOrder.order = req.body.order;
	//set the buyer to the id of the user that placed the order
	newOrder.buyer = req.session.id2;
	//set the name of buyer to the name of the user that placed the order
	newOrder.nameOfBuyer = req.session.username;
	//save it in the database
	newOrder.save(function (err) {
		if (err) {
			console.log(err);
			res.status(500).send("Error creating User.");
			return;
		};
		//end the response to tell the user that his order was recieved and processed
		res.end();
	});
});


module.exports = router;