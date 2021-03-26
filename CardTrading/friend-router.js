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
router.get("/search", search);
router.post("/request", express.json(), sendFriendRequest);
router.post("/accept", response);
//Search looks for all the user exists
function search(req, res) {
	var USERS = [];
	var duplicate = [];
	User.find()
	//makes sure that capitalization and missing charcters do no interfer 

		//finds the username with the name mentioned in the query ,* ignores everything before
		//and everything after where i ignores case sensestivity
		.where("username").regex(new RegExp(".*" + req.query.name + ".*", "i"))
		.exec(function (err, results) {
			if (err) {
				res.status(500).send("Error Finding users.");
				return;
			};
			//respond with the reults
			for (key in results) {
				if (results[key].username != req.session.username) {
					USERS.push(results[key])
				}
			}
			//remove the current user friends from the search results		
			User.findOne({
				//find someone with username matches the username provided
				_id: new ObjectId(req.session.id2)
			}).then((results) => {
				if (results.friends.user) {
					results.friends.userid.forEach(async key => {
						for (a in USERS) {
							if (JSON.stringify(USERS[a]._id) == JSON.stringify(key)) {
								duplicate.push(a);
							}
						}
					});
				while (duplicate[0]) { //while there is a duplicate user find the index in the USERS array and remove it
					USERS.splice(duplicate[duplicate.length - 1], 1)
					//then remove the last element sort of (like how pop works)
					duplicate.splice([duplicate.length - 1], 1)
				}
			}
				if (results.friendreq.user) { //we do the same thing but for freindrequests
					duplicate = [] //if a user has a friend request remove him from the list of array
					results.friendreq.userid.forEach(async key => {
						for (a in USERS) {
							if (JSON.stringify(USERS[a]._id) == JSON.stringify(key)) {
								duplicate.push(a);
							}
						}
					while (duplicate[0]) {
						USERS.splice(duplicate[duplicate.length - 1], 1)
						duplicate.splice(duplicate.length - 1, 1)
						}
					});
				} //send the array of users to the client
				res.send(USERS)
			})
		});
}

// ====================================================== //
//  Send Friend Request sends a friend request to a user  //
// ====================================================== //
function sendFriendRequest(req, res) {
	let userid = new ObjectId(req.session.id2)
	let user = req.session.username
	//add to set makes sure that a user cant get spammed with friend requests
	User.findOneAndUpdate({
		//find someone with username matches the username provided
		_id: new ObjectId(req.body.id)
	}, {
		$addToSet: {
			//update the users privacy
			friendreq: {
				userid,
				user
			}
		}
	}, {
		upsert: true
	}, function (err, success) {
		if (err) console.log(err)
	});
	res.status(200).redirect("/"); //redirect the user after a friend request has been made
}

// ====================================================== //
// ===== //if a user accepts or ignores the request ===== //
// ====================================================== //
function response(req, res) {
	if (req.body.ignore) { //if a user ignores the request remove the user from our friend reqhest
		remove(req.session, req.body.ignore)
		if (1) {
			res.status(200).redirect("/"); //redirecting him to the home page after he ignores
		}
	}
	//if a user accepts
	if (req.body.accept) {
		let user = JSON.parse(req.body.accept) //setting the response as an object
		add(req.session, user) //add the user 
		if (1) {
			//after a user has been added flag that you should also add the user to the person submitting the friend request
			add(req.session, user, user)
			//and then remove that friend request since he accepted
			remove(req.session, user.userid)
			//redirect
			res.status(200).redirect("/");
		}
	}
}

function add(session, user, acceptedFriend) {
	//if acceptedfriend is flagged change my parameters to match the other user
	if (acceptedFriend) {
		var userid = new ObjectId(user.userid)
		var id = new ObjectId(session.id2)
		var name = session.username;
	} else {//otherwise deal with this user (the logged in user)
		var userid = new ObjectId(session.id2)
		var id = new ObjectId(user.userid)
		var name = user.user;

	}
	//make sure that duplicate users cant be added
	User.findOneAndUpdate({
		//find someone with username matches the username provided
		_id: userid
	}, {
		$addToSet: {
			//update the users privacy
			friends: {
				userid: id,
				user: name
			}
		}
	}, {
		upsert: true
	}, function (err, success) {
		if (err) console.log(err)
		if (success) {
			return 1;
		}
	});
}

// ====================================================== //
// ======== Removes the User from friend Requests ======= //
// ====================================================== //
function remove(session, del) {
	let userid = new ObjectId(session.id2)
	User.findOneAndUpdate({
		//find someone with username matches the username provided
		_id: userid
	}, {
		$pull: {
			//update the users privacy
			friendreq: {
				userid: new ObjectId(del)
			}
		}
	}, {
		multi: true
	}, function (err, success) {
		if (err) console.log(err)
		if (success) {
			return 1
		}
	});
}
//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;

