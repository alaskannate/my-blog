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

app.customRender = function (root, name, fn) {

  var engines = app.engines;
  var cache = app.cache;

  view = cache[root + '-' + name];

  if (!view) {
    view = new(app.get('view'))(name, {
      defaultEngine: app.get('view engine'),
      root: root,
      engines: engines
    });

    if (!view.path) {
      var err = new Error('Failed to lookup view "' + name + '" in views directory "' + root + '"');
      err.view = view;
      return fn(err);
    }

    cache[root + '-' + name] = view;
  }

  try {
    view.render(opts, fn);
  } catch (err) {
    fn(err);
  }
}

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

//NEW FLASHCARD SCHEMA
const flashcardSchema = new mongoose.Schema({
  title: String,
  body: String,
});
const Card = mongoose.model('Card', flashcardSchema)

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


//MAIN HOME PAGE GETs
app.get("/", (req, res) => {

  Post.find({})
    .sort({
      _id: -1
    })
    .then((foundPosts) => {
      res.render('home', {
        newPost: foundPosts,
      });
    })
    .catch((error) => {
      console.error('Error Finding items:', error);
      res.status(500).send(error);
    });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/about", (req, res) => {
  res.render("about", {});
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

app.get("/portfolio", (req, res) => {
  res.render('portfolio', )
});


app.get("/flashcards", (req, res) => {

  Card.find({})
    .then((foundCard) => {
      res.render('flashcards', {
        newCard: foundCard
      });
      console.log(foundCard)
    })
    .catch((error) => {
      console.error('Error Finding items:', error);
      res.status(500).send(error);
    });
});

app.get("/crypto", (req,res) => {
  res.render('crypto')
})




// ADMIN PAGE ADDTIONALY FUNCTIONALITY

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

app.get("/delete", (req, res) => {
  // Using Promise.all to handle both queries simultaneously
  Promise.all([
    Post.find({}).sort({ _id: -1 }),
    Card.find({}).sort({ _id: -1 })
  ])
    .then(([foundPosts, foundCard]) => {
      // Render the view after both queries are done
      res.render('delete', {
        newPost: foundPosts,
        newCard: foundCard,
      });
    })
    .catch((error) => {
      console.error('Error Finding items:', error);
      res.status(500).send(error);
    });
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
      console.log("Error occurred during login:", err);
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('/admin');
    })

  });

});

// Route for creating a new post
app.post("/compose/post", async (req, res) => {
  const postDate = date.getDate();
  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  try {
    // Save the new post
    const newPost = new Post({
      date: postDate,
      title: postTitle,
      body: postBody,
    });
    await newPost.save();

    // Redirect to the appropriate route after the post is saved
    res.redirect("/compose");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving post to database.");
  }
});

// Route for creating a new flashcard
app.post("/compose/flashcard", async (req, res) => {
  const flashcardTitle = req.body.flashcardTitle;
  const flashcardBody = req.body.flashcardBody;

  try {
    // Save the new flashcard
    const newFlashcard = new Card({
      title: flashcardTitle,
      body: flashcardBody,
    });
    await newFlashcard.save();

    // Redirect to the appropriate route after the flashcard is saved
    res.redirect("/flashcards");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving flashcard to database.");
  }
});

app.post("/delete/post", async (req, res) => {
  const blogIDArray = req.body.blogID;

  async function deletePostByID(postID) {
    try {
      // Use Mongoose's deleteOne method to delete the post by its ID
      await Post.deleteOne({ _id: postID });
      console.log(`Post with ID ${postID} deleted.`);
    } catch (error) {
      console.error(`Error deleting post with ID ${postID}:`, error);
    }
  }

  if (Array.isArray(blogIDArray)) {
    // If multiple checkboxes are selected (array of IDs)
    blogIDArray.forEach((postID) => deletePostByID(postID));
  } else if (typeof blogIDArray === "string") {
    // If only one checkbox is selected (single ID)
    deletePostByID(blogIDArray);
  }

  res.redirect("/delete"); // Redirect to the appropriate URL after deletion
});


app.post("/delete/flashcard", async (req, res) => {
  const flashcardIDArray = req.body.flashcardID;

  async function deletePostByID(flashcardID) {
    try {
      // Use Mongoose's deleteOne method to delete the post by its ID
      await Card.deleteOne({ _id: flashcardID });
      console.log(`Post with ID ${flashcardID} deleted.`);
    } catch (error) {
      console.error(`Error deleting post with ID ${flashcardID}:`, error);
    }
  }

  if (Array.isArray(flashcardIDArray)) {
    // If multiple checkboxes are selected (array of IDs)
    flashcardIDArray.forEach((flashcardID) => deletePostByID(flashcardID));
  } else if (typeof flashcardIDArray === "string") {
    // If only one checkbox is selected (single ID)
    deletePostByID(flashcardIDArray);
  }

  res.redirect("/delete"); // Redirect to the appropriate URL after deletion
});








// LOCAL SERVER START UP...

let port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
  console.log("Server started on port 3000");
}
app.listen(port);