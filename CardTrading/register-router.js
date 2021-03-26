// ====================================================== //
// ==================== Node modules ==================== //
// ====================================================== //
const mongoose = require("mongoose");
const express = require('express');
let router = express.Router();
// ====================================================== //
// ==================== Schemas Used ==================== //
// ====================================================== //
const register = require("./UserModel");

router.get("/", load);
router.post("/", uniqueaccount);
var MAX_NUM_CARDS=10 

//if a user is trying to register load this page
function load(req, res,next) {
	//removes the warnings if user inputs incorrect username and password in the header
	req.session.auth = false;
	if (req.session.loggedin) {
		//if a user is logged in and tries to register the server will log him out
		req.session.loggedin = false;
	};
	res.format({
		"text/html": () => {
			//if a user just opened /register unflag the error
			req.session.fail = false;
			res.render("pages/register", {
				user: req.session
			});
		}
	});
	next();
};

// ====================================================== //
//  	uniqueaccount makes sure not to create			  //
//			    a user unless its unqiue                  //
// ====================================================== //
function uniqueaccount(req, res) {
	mongoose.connection.db.collection("users").findOne({
		username: req.body.username
	}, function (err, result) {
		if (err) throw err;
		if (result) {
			//if there is a user with the same name flag the error
			req.session.fail = true;
			res.render("pages/register", {
				user: req.session
			});
		} else {
			mongoose.connection.db.collection("cards").count({}, function (err, number_Of_Cards, next) {
				if (err) throw err;
				if (number_Of_Cards) {
					var Cards = [];
					var i;
					for (i = 0; i < MAX_NUM_CARDS; i++) {
						//random cards based on the time of day in getMilliseconds 
						var random = Math.floor(Math.random(new Date().getMilliseconds()) * number_Of_Cards)
						mongoose.connection.db.collection("cards").findOne({
							number: random
						}, function (err, card, next) {
							if (err) throw err;
							if (card) {
								Cards.push(card)
								next;
							}
							if (Cards[MAX_NUM_CARDS-1]) {//-1 to count for 0
								var newuser = new register();
								newuser.username = req.body.username;
								newuser.password = req.body.password;
								newuser.cards = Cards;
								newuser.save(function (err, saveduser) {
									if (err) {
										console.log(err);
										res.status(500).send("Error creating User.");
										return;
									};
									//log that user in if everything is successful
									req.session.loggedin = true;
									req.session.username = req.body.username;
									req.session.id2 = saveduser.id;
									//redirect the user to his profile
									res.redirect("http://localhost:3000/users/" + saveduser.id);
								});
							}
						})
					}
				}
			})
			//if a user has already flagged the error but was not able to register unflag it
			req.session.fail = false;
		};
	});
};

//Export the router so it can be mounted in the main app
module.exports = router;