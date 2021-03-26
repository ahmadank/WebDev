onload();
//call this function when a website loads
function onload() {
	$(document).ready(function () {
		//every 5 secs every jquery refreshs the data on the webpage
		setInterval(function () {
			$("#request").load(window.location.href + " #request");
			$("#refresh").load(window.location.href + " #refresh");
			$("#refresh1").load(window.location.href + " #refresh1");
			$("#refresh2").load(window.location.href + " #refresh2");
		}, 5000);
	});
	document.getElementById("submitTrade").addEventListener('click', function () {
		//when a user clicks a trade call this function
		trade(myCardsTrade(), friendTrade())
	})
}

function search() {
	//search sends an xmlhttp request to get the list of users
	let userid = document.getElementById('username').value;
	req = new XMLHttpRequest();
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById('users').innerHTML = '';
			var users = JSON.parse(this.responseText);
			for (u in users) {
				//after it gets the users it makes a form the contains a button for every user to add
				var user = document.createElement('user');
				user.innerHTML = '<form action="/friends/request" method="post"><div class="userNameAddFriend">' + (users[u].username) + '<button name="id" class="buttonAddFriend" type="submit" onclick="Alert(1)" value="' + users[u]._id + '">Add Friend</button></form></div>'
				//appends the user to the list of users
				document.getElementById('users').appendChild(user);
			}
		}
	}
	req.open("GET", `http://localhost:3000/friends/search?name=` + userid)
	req.send();
}

function Alert(friendRequest) {
	if (friendRequest) {
		alert("A Friend Request Was Sent");
	} else {
		alert("Trade Request Successfully Sent");
	}
}

function userRequestedTrade() {
	//gets the user we are requesting to trade with
	var user = document.getElementById('tradeform').id.value;
	//if no user value was there (default option) return nothing
	if (!user) return document.getElementById('tradecards').innerHTML = '';
	req = new XMLHttpRequest();
	//xml request to get the cards that user has
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById('tradecards').innerHTML = '';
			var cards = JSON.parse(this.responseText);
			friendCards(cards)
		}
	}
	req.open("GET", `http://localhost:3000/trade/?id=` + user)
	req.send();
}

//makes a button for every card the "friend" has
function friendCards(cards) {
	for (key in cards) {
		card = cards[key]
		let specfiedCard = document.createElement('specfiedCard');
		specfiedCard.innerHTML = '<input class="hisCards" type="checkbox" value=' + card._id + ' name=' + JSON.stringify(card.name) + '><label for ' + card.name + '><a href="/cards/' + card._id + '">' + card.name + '<br>'
		document.getElementById('tradecards').appendChild(specfiedCard);
	}
}

//returns the list of cards that I selected to trade from my deck
function myCardsTrade() {
	var myCards = [];
	var listOfCards = document.getElementsByClassName('mycards');
	for (var i = 0; i < listOfCards.length; i++) {
		if (listOfCards[i].checked) {
			myCards.push(listOfCards[i].name)
		}
	}
	return myCards
}

//returns the list of cards that I selected to trade from my friends deck
function friendTrade() {
	var hisCards = [];
	let inputElements = document.getElementsByClassName('hisCards');
	for (var i = 0; i < inputElements.length; i++) {
		var checkedValue = inputElements[i].checked; //if the check box is checked
		if (checkedValue) {
			hisCards.push(inputElements[i].name) //push it to the list of cards
		}
	}
	return hisCards;
}
//trade just post the trade request with my cards and his cards
function trade(myCards, hisCards) {
	let id = document.getElementById('tradeform').id.value;
	let tradeUserName = ($("#id option:selected").text())
	if (id) {
		if (myCards[0] || hisCards[0]) {
			$.post("/trade/trade", {
				myCards: myCards,
				hisCards: hisCards,
				friendId: id,
				tradeUserName: tradeUserName
			});
			alert("Trade Succesfully Sent")
			window.location.replace("/")
		} else {
			alert("Please select at least one card") //if no cards were selected display and error
		}
	} else {
		alert("You have to select a user to trade with") //if no users were selected display and error
	}
}