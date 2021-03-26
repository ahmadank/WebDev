// ====================================================== //
// ==================== Node modules ==================== //
// ====================================================== //
const mongoose = require("mongoose");
const express = require('express');
let router = express.Router();
// ====================================================== //
// ==================== Schemas Used ==================== //
// ====================================================== //
const ObjectId = require('mongoose').Types.ObjectId
const User = require("./UserModel");

// ====================================================== //
// =============== couple of get requests =============== //
// ====================================================== //

//load the current User
router.get("/:uid", sendSingleUser);
//Load a user based on uid parameter
router.param("uid", function (req, res, next, id) {
	req.session.auth = false;
	//if the id is less than a String of 12 bytes or a string of 24 hex characters
	try {
		new ObjectId(id);
	} catch (err) {
		res.status(404).send("The ID provided is incorrect please check the ID provided");
		return;
	};
	//finds the users associated with the id given
	mongoose.connection.db.collection("users").findOne({
		_id: new ObjectId(id)
	}, function (err, user) {
		if (err) {
			console.log(err);
			res.status(500).send("Error reading the user provided");
			return;
		};
		if (!user) {
			res.status(404).send("User" + id + " does not exist.");
			return;
		};
		req.user = user;
		if (req.session.username === req.user.username && req.session.loggedin) {
			//if a user is loggedin and his username matches the one on file then set that the user is viewing his own profile
			req.user.ownprofile = true;
		};
		next();

	});
});

// ====================================================== //
//  sendSignleuser sends a single user back with his purchases  //
// ====================================================== //
function sendSingleUser(req, res, next) {

	if(!req.session.loggedin){res.status(404).send("you have to log in First Click On one of those two links to either go home or register <a href=/>home</a> <a href=/register>Register</a>");}
	else if(JSON.stringify(req.user._id) == JSON.stringify(req.session.id2)){
			res.format({
				"text/html": () => {
					res.render("pages/user", {
						otherU: req.user,
						user: req.session
					});
				}
			});
		}else{
			res.format({
				"text/html": () => {
					res.render("pages/friend", {
						otherU: req.user,
						user: req.session
					});
				}
			});
		}
		next();
	}


//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;