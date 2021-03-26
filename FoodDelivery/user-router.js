// ====================================================== //
// ==================== Node modules ==================== //
// ====================================================== //
const mongoose = require("mongoose");
const express = require('express');
let router = express.Router();
// ====================================================== //
// ==================== Schemas Used ==================== //
// ====================================================== //
const nOrder = require("./orderModel");
const ObjectId = require('mongoose').Types.ObjectId
const User = require("./UserModel");

// ====================================================== //
// =============== couple of get requests =============== //
// ====================================================== //
router.get("/", loadUsers);
router.get("/", respondUsers);
router.get("/:uid", sendSingleUser);
//if a user makes a post request to update his privacy
router.post("/:uid", express.json(), savePrivacy);

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

function savePrivacy(req, res) {
	User.findOneAndUpdate({
		//find someone with username matches the username provided
		username: req.user.username
	}, {
		$set: {
			//update the users privacy
			privacy: req.body.privacy
		}
	}, {
		upsert: true
	}, function (err, success) {
		if (err) {
			throw err;
		} else {
			//redirect him back to his webpage
			res.redirect("http://localhost:3000/users/" + success.id);
		}
	});
};

function loadUsers(req, res, next) {
	//incase a user forgets his username and he goes to view it in users the error msg will go away
	req.session.auth = false;
	//if no name has been defined in the query all names will be printed
	if (!req.query.name) {
		req.query.name = "?";
	}
	User.find()
		//finds the username with the name mentioned in the query ,* ignores everything before
		//and everything after where i ignores case sensestivity
		.where("username").regex(new RegExp(".*" + req.query.name + ".*", "i"))
		.exec(function (err, results) {
			if (err) {
				res.status(500).send("Error Finding users.");
				return;
			};
			//respond with the reults
			res.user = results;
			next();
			return;
		});
};


//renders a pug page
function respondUsers(req, res, next) {
	res.format({
		"text/html": () => {
			res.render("pages/users", {
				otherU: res.user,
				user: req.session
			});
		}
	});
	next();
};
// ====================================================== //
//  sendSignleuser sends a single user back with his purchases  //
// ====================================================== //
function sendSingleUser(req, res, next) {
	nOrder.find({
		buyer: req.user._id
	}).then((orders) => {
		req.user.purchases = orders
		//if the user is not private or he is viewing his own profile respond with the page
		if (!req.user.privacy || req.user.ownprofile) {
			res.format({
				"text/html": () => {
					res.render("pages/user", {
						otherU: req.user,
						user: req.session
					});
				}
			});
			next();
			//otherwise tells the viewer he is not authorized 
		} else {
			res.status(403).send("Sorry You are not authorized to view this user <a href=/>Click me To Go Home</a>");
		};
	}).catch((e) => {
		//if there was an error log it
		console.log(e)
	});
};


//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;