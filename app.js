//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// Create session 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// MAIN DATABASE SECTION

//Connecting to our database...
const uri = process.env.MONGO_DB_URI

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
}
connect();

//NEW POSTS SCHEMA 
const postSchema = new mongoose.Schema({
  date: String,
  title: {
    type: String,
    required: [true, "a title is required"],
    minlength: [1, "This title is too short"],
    maxlength: [75, "This title is too long"],
    trim: true,
  },
  body: {
    type: String,
    required: [true, "a text body is required"],
    minlength: [10, "This text body is too short"],
    maxlength: [10000, "This text body is too long"],
    trim: true,
  }
});
const Post = mongoose.model('Post', postSchema);


//NEW USER SCHEMA
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//MAIN APPLICATION LOGIC


//GET LOGIC

//MAIN HOME PAGE GETs
app.get("/", (req, res) => {

  Post.find({})
  .sort({ _id: -1 })
    .then((foundPosts) => {
      res.render('home', {
        newPost: foundPosts,
      });
      console.log(foundPosts)
    })
    .catch((error) => {
      console.error('Error Finding items:', error);
      res.status(500).send(error);
    });
});

app.get("/login", (req, res) => {
  res.render("login", );
});

app.get("/about", (req, res) => {
  res.render("about", {
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", )
});

app.get('/post/:postID', (req, res) => {

  const requestedPost = req.params.postID;

  Post.findById(requestedPost.toString())
    .then((foundPost) => {
      res.render('post', {
        foundPost: foundPost,
      });
    })
    .catch((error) => {
      console.error('Error Finding items:', error);
      res.status(500).send('Error retrieving items');
    });
});


// PORTFOLIO GETs & PAGES


app.get("/flashcards", (req, res) => {
  res.render('flashcards',);
})



// ADMIN PAGE GETs & ADDTIONALY FUNCTIONALITY

app.get('/admin', (req, res) => {
  if (req.isAuthenticated()) {
      res.render("admin")
  } else {
      res.redirect('/login')
  }
});

app.get("/compose", (req, res) => {
  res.render("compose", );
});

app.get("/delete", (req,res) => {

  res.render("delete",)
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
      console.log(err)
  });
  res.redirect('/');
});



// POST LOGIC 

app.post("/register", (req, res) => {

  User.register({
      username: req.body.username
  }, req.body.password, (err, user) => {
      if (err) {
          console.log(err);
          res.redirect('/register');
      } else {
          passport.authenticate('local')(req, res, () => {
              res.redirect('/admin');
          })
      }
  })
});

app.post("/login", (req, res) => {

  const user = new User({
      username: req.body.username,
      password: req.body.password
  });

  req.login(user, (err) => {
      if (err) {
          console.log(err);
      } else {
          passport.authenticate('local')(req, res, () => {
              res.redirect('/admin');
          })
      };

  });

});

app.post("/compose", async (req, res) => {

  const postDate = date.getDate();
  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  //Creating a new item instance...
  const newPost = new Post({
    date: postDate,
    title: postTitle,
    body: postBody
  });
  try {
    //... and then saving item to mongoDB collection.
    await newPost.save();
    res.redirect("/");
  } catch (err) {
    console.log(err)
    res.status(500).send("Error saving items to database.");
  }
});




// LOCAL SERVER START UP...

let port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
  console.log("Server started on port 3000");
}
app.listen(port);