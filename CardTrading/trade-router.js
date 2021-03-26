// ====================================================== //
// ==================== Node modules ==================== //
// ====================================================== //
const mongoose = require("mongoose");
const express = require('express');
// ====================================================== //
// ==================== Schemas Used ==================== //
// ====================================================== //
const ObjectId = require('mongoose').Types.ObjectId;
const User = require("./UserModel");
// ~~~~~~~~~~ creating a router ~~~~~~~~~~ //
let router = express.Router();

// ~~~~ converts a string to an object ~~~ //
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
	extended: false
}));
router.use(bodyParser.json());

router.get("/", userTrade);
router.post("/trade", sendTradeRequest)
router.get("/:uid", sendTrade)
router.post("/response", response)

//finds the user we are trying to trade with and send his cards to the server
function userTrade(req, res) {
	let id = req.query.id;
	//looks in the orders collection for an order that has the object representation of the id given
	mongoose.connection.db.collection("users").findOne({
		_id: new ObjectId(id)
	}, function (err, result) {
		if (err) throw err;
		res.send(result.cards)
	});
}



function sendTradeRequest(req, res) {
	//send trade info for my self
	var thisId = req.session.id2
	var hisId = req.body.friendId
	var myCards = req.body.myCards
	var hisCards = req.body.hisCards
	var tradingWith = req.body.tradeUserName
	var tradeInitialize = req.session.username
	var tradeid = new ObjectId();
	//  send the trade request to the user I am trading with  //
	if (req.body.oldid) {
		tradeid = req.body.oldid; //to give the users the same tradeid I saved my trade id in the req.body 
		thisId = req.body.friendId
		hisId = req.session.id2
		myCards = req.body.hisCards
		hisCards = req.body.myCards
		tradingWith = req.session.username
	}

	//find the id and inject the friend request in thre
	User.findOneAndUpdate({
		_id: new ObjectId(thisId)
	}, {
		$addToSet: {
			//update the users privacy
			tradereq: {
				tradeInit: tradeInitialize,
				tradeId: tradeid,
				userid: hisId,
				cardGivenId: myCards,
				cardTakenId: hisCards,
				userTradingWith: tradingWith

			},
		}
	}, {
		upsert: true
	}, function (err, success) {
		if (err) console.log(err)
		if (req.body.oldid) {
			return
		}
		if (success) {
			req.body.oldid = tradeid //saving the old id 
			sendTradeRequest(req, res) //calling the function now with an old id
		}
	});
}



// ====================================================== //
//  SendTrade displays the current trade that a user is looking at  //
// ====================================================== //
function sendTrade(req, res) {
	let tradeid = new ObjectId(req.params.uid)
	mongoose.connection.db.collection("users").findOne({
		_id: new ObjectId(req.session.id2)
	}, function (err, user) {
		if (err) {
			console.log(err);
			res.status(500).send("Error reading the user provided");
			return;
		};
		if (!user) {
			res.status(404).send("trade" + " does not exist.");
			return;
		} else {
			user.tradereq.forEach(async trade => {
				if (JSON.stringify(trade.tradeId) == JSON.stringify(tradeid)) {
					console.log(trade)
					//if a user is logged in was part of the trade show him the information
					if ((user.username == req.session.username || trade.tradeInit == req.session.username) && req.session.loggedin) {
								res.render("pages/trade", {
									trades: trade,
									user: req.session
								});
					} else {
						//otherwise dont
						res.status(403).send("Unathorized")
					}
				}
			})
		};
	})
}





function response(req, res) {
	req.authorized=true;
	if (req.body.ignore) {
		var tradeId = JSON.parse(req.body.ignore);
		if (tradeId[0]) {
			req.tradeId = tradeId[0]
			req.userid = tradeId[1]
		}
		remove(req, res)
	}
	//if a user accepts
	if (req.body.accept) {
		mongoose.connection.db.collection("users").findOne({
			_id: new ObjectId(req.session.id2) //since only the other user can accept a trade we need to know who is logged in
		}, function (err, success) {
			if (err) console.log(err)
			if (success) {
				req.success = success
				//call authorize to make sure both users have their cards
				authorize(req, res)
				return;
			}

		})
	}
}

async function authorize(req, res) {
	var user = req.success
	var counter = 0;
	//the logged in user
	tradeid = req.body.accept
	user.tradereq.forEach(async trade => { //for each trade look to see if that trade matches the one we are looking for
		if (JSON.stringify(trade.tradeId) == JSON.stringify(tradeid)) { //if it does
			req.tradeId = trade //set the current trade
			if (trade.tradeInit != req.session.username) { //I can only accept if I did not initallize the trade
				if (trade.cardGivenId) { //if cards where given
					user.cards.forEach(async card => {
						trade.cardGivenId.forEach(async tradedCard => {
							if (card.name == tradedCard) {
								counter++; //increase the counter that specifies if I have all the cards
							}
						})
					})
					if (counter != trade.cardGivenId.length) { //if I dont have the cards that I am supposed to give return 0
						res.send("SORRY CARD IS ALREADY TRADED") //delete the trade after
						req.authorized = false;
						return 0;
					}
				}
				counter = 0;
				if (trade.cardTakenId) {
					User.findOne({
						_id: trade.userid
					}).then((tradingWith) => {
						tradingWith.cards.forEach(async card => {
							trade.cardTakenId.forEach(async tradedCard => {
								if (card.name == tradedCard) {
									counter++;
								}
							})
						})
						if (counter != trade.cardTakenId.length) {
							res.send("SORRY CARD IS ALREADY TRADED")
							req.authorized = false;
							return 0;
						}
					})
				}
			}
		}
	})
	//if both cases pass accept the trade
	accept(req, res)
	return;
}

function accept(req, res) {
	if (req.authorized) {
		var user = req.success
		var thisTrade = req.tradeId
		var userWorkingWith = user._id
		var cardToMove = thisTrade.cardGivenId
		var other = thisTrade.userid;
		if (req.otherUser) { //if the flag is on switch the user we are working with
			userWorkingWith = thisTrade.userid;
			cardToMove = thisTrade.cardTakenId
			other = user._id
		}
		User.findOne({
			//find someone with username matches the username provided
			_id: new ObjectId(userWorkingWith)
		}, function (err, success) {
			if (err) console.log(err)
			if (success) {
				if (cardToMove) {
					cardToMove.forEach(async trade => {
						var cardsMoved = [] //save thh cards in an array
						success.cards.forEach(async (card) => {
							if (trade == card.name) {
								cardsMoved.push(card)
								User.findOneAndUpdate({
									//find someone with username matches the username provided
									_id: new ObjectId(userWorkingWith)
								}, {
									$pull: { //remove the cards that the user have
										cards: {
											name: trade
										}
									}
								}, {
									multi: true
								}, function (err, success) {
									if (err) console.log(err)
									if (success) {
										cardsMoved.forEach(async (movingCard) => { //for every card that was removed from user X add it to user Y
											User.findOneAndUpdate({
												//find someone with username matches the username provided
												_id: new ObjectId(other)
											}, {
												$push: {
													//update the users privacy
													cards: movingCard
												}
											}, {
												upsert: true
											}, function (err, success) {
												if (err) console.log(err)
											});
										})
									}

								});
							}

						})
					})
				}
				if (req.otherUser) {
					remove(req, res)
					return
				}
				req.otherUser = true;
				accept(req, res)
			}
		})
	}
}

function remove(req, res) {
	if(req.authorized){
	var userid = req.session.id2;
	var del;
	var otherUser
	if (req.success) {
		del = req.tradeId.tradeId
		otherUser = req.tradeId.userid
	} else {
		del = req.tradeId
		otherUser = req.userid
	}
	if (req.flag == "1") {
		userid = otherUser
	}
	User.findByIdAndUpdate({
		//find someone with username matches the username provided
		_id: new ObjectId(userid)
	}, {
		$pull: {
			tradereq: {
				tradeId: new ObjectId(del)
			}
		}
	}, {
		multi: true
	}).then((success) => {
		if (success && req.flag) {
			res.status(200).redirect("/");
			return
		}
		req.flag = 1;
		remove(req, res)
	}).catch((e) => {
		console.log(e)
	})
	}
}
module.exports = router;