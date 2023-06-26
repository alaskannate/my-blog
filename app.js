//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const todaysDate = date.getDate()

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));



// MAIN DATABASE SECTION

//Connecting to our database...
const uri = "mongodb+srv://nateewing93:Travelin.20@cluster0.cxhnnxh.mongodb.net/?retryWrites=true&w=majority";

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
}
connect();

//Defining schema for the datebase collection "posts"...
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
    maxlength: [1000, "This text body is too long"],
    trim: true,
  }
});
const Post = mongoose.model('Post', postSchema);

//Defining schema for the database collection "user"...
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "required"],
    minlength: [2, "Sorry, this name is too short"],
    maxlength: [25, "Sorry, this name is too long"]
  },
  email: {
    type: String,
    required: [true, "required"],
  },
  authoredPosts: postSchema
});
const User = mongoose.model('User', userSchema)



// this is one way to delete an item from a databas.
// Post.deleteOne({ date: "today" })
// .then(() => {
//   console.log("successfully deleted the document");
// })
// .catch((err) => {
//   console.log(err);
// });


// "find" collection data and log to the console. check for errors, if any log those. 
// User.find({})
//   .then((users) => {
//     users.forEach((user) => {
//       console.log(user.name);
//     });
//   })
//   .catch((err) => console.error('Error querying collection:', err))
//   .finally(() => mongoose.disconnect());





//MAIN APPLICATION LOGIC


app.get("/", (req, res) => {

  Post.find({})
    .then((foundPosts) => {
      res.render('home', {
        newPost: foundPosts,
      });
      console.log(foundPosts)
    })
    .catch((error) => {
      console.error('Error Finding items:', error);
      res.status(500).send('Error retrieving items');
    });
});


// gets about content
app.get('/about', (req, res) => {
  res.render('about', {
    aboutContent: aboutContent
  });
});

// gets contact content 
app.get('/contact', (req, res) => {
  res.render('contact', {
    contactContent: contactContent
  });
});

//gets compose page where user can create new content. 
app.get('/compose', (req, res) => {
  res.render('compose', );
});


app.get('/login', (req, res) => {
  res.render('login', );
});

app.post("/compose", async (req, res) => {

  const postDate = todaysDate;
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


app.get('/post/:postID', (req, res) => {

  const requestedPost = req.params.postID;

  Post.findById(requestedPost.toString())
    .then((foundPost) => {
      res.render('post', {
        foundPost: foundPost,
      });
    })
    .catch((error) => {
      console.log(requestedPost)
      console.log(requestedPost)
      console.log(requestedPost)
      console.error('Error Finding items:', error);
      res.status(500).send('Error retrieving items');
    });
});


app.listen(3000, () => {
  console.log("Server started on port 3000");
});