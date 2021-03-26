// ====================================================== //
// ==================== Node modules ==================== //
// ====================================================== //
const express = require('express');
const app = express();
var path = require('path');
const mongoose = require("mongoose");
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);

// ====================================================== //
// ================== Creating Sessions ================= //
// ====================================================== //
const store = new MongoDBStore({
	uri: 'mongodb://localhost:27017/a4',
	collection: 'sessions'
});

app.use(session({
	secret: 'some secret here',
	store: store
}))
// ~~~~~~ Setting View Engine to pug ~~~~~ //
app.set("view engine", "pug");

// ~~ To take HTML data and stringfy it ~~ //
app.use(express.urlencoded({
	extended: true
}));

//  Uses Public as a directoy for my html file  //
app.use(express.static("public"));

// ====================================================== //
// ============= Creating and using Routers ============= //
// ====================================================== //
let userRouter = require("./user-router");
app.use("/users", userRouter);
let registerRouter = require("./register-router");
app.use("/register", registerRouter);
let orderRouter = require("./order-router");
app.use("/orders", orderRouter);

// ====================================================== //
// ================= Loads The Main Page ================ //
// ====================================================== //
app.get('/', function (req, res) {
	req.session.auth = false;
	req.session.log = false;
	res.render('pages/index', {
		user: req.session
	});
});

// ==========================================================  //
//  If the html file asks to go to my profile then the server //
//  	is able to redirect them to the logged in user       //
// ======================================================== //
app.get('/profile', function (req, res) {
	if (req.session.loggedin){
		res.redirect("/users/" + req.session.id2);
	}else{
		res.status(404).send("you have to log in First Click On one of those two links to either go home or register <a href=/>home</a> <a href=/register>Register</a>");
	}
	return;
});

//  If the user request to make an order this function gets called  //
app.get('/order', function (req, res) {
	//if the user is logged in allow him to order
	if (req.session.loggedin) {
		res.sendFile(path.join(__dirname + '/public/orderform.html'));
		//otherwise send the user a 403 error and direct him to a webpage that gives back an error
	} else {
		res.status(403).send("you have to log in First Click On one of those two links to either go home or register <a href=/>home</a> <a href=/register>Register</a>");
	};
});
// ##################################################################### //
// #################### This function Is for loging in ################### //
// ##################################################################### //

app.post("/login", function (req, res) {
	if (req.session.loggedin) {
		return;
	};
	// ====================================================== //
	//  This function looks in the database to see authorize a user
	//   by looking for a username and checking his password  //
	// ====================================================== //
	mongoose.connection.db.collection("users").findOne({
		username: req.body.username
	}, function (err, user) {
		if (err) throw err;
		if (user) {
			//if a user was found check his password
			if (user.password === req.body.password) {
				//if the password matches set the user to be logged in and add some information about the user
				req.session.loggedin = true;
				req.session.username = req.body.username;
				//id2 is basically the user id
				req.session.id2 = user._id;
				//auth is basically my take on displaying an error if incorrect data was given
				//since correct data was given we set it to false
				req.session.auth = false;
				//sends the user back to the homepage
				res.redirect("/");
			} else {
				//if the user was found but password did not match render the page and display the error
				//and send a 401 status
				req.session.auth = true;
				res.status(401).render('pages/index', {
					user: req.session
				});
			}
		} else {
			//if the user was not found render the page and display the error
			//and send a 401 status
			req.session.auth = true;
			res.status(401).render('pages/index', {
				user: req.session
			});
		}
	});
});
//log out just logs a user out
app.get("/logout", function (req, res) {
	req.session.loggedin = false;
	res.redirect("/");
})
//connect to a database
mongoose.connect('mongodb://localhost/a4', {
	useNewUrlParser: true
});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
//once the info has been read open the server
db.once('open', function () {
	app.listen(3000);
	console.log("Server listening on port 3000");
});