//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");


// MAIN DATABASE SECTION.


//Connecting to the database. 
const uri = "mongodb+srv://nateewing93:Travelin.20@cluster0.cxhnnxh.mongodb.net/?retryWrites=true&w=majority";

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }

  //Defined blog-post schema.
  const postSchema = new mongoose.Schema({
    date: String,
    title: {
      type: String,
      required: [true, "required"],
      minlength: 1,
      maxlength: 50,
      trim: true,
    },
    
    body: {
      type: String,
      required: [true, "required"],
      minlength: [25, "This is too short"],
      maxlength: [1000, "This is too long"],
      trim: true,
    }
  });
  const Post = mongoose.model('Post', postSchema);


  //Defined user schema
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


  //tests...


  const newPost = new Post({
    date: "tomorrow",
    title: "realationship test #1",
    body: "not a very short peice of text",

  });

  newPost.save();

  const user = new User({
    name: "Shea",
    email: "Shea.ewing93@gmail.com",
    authoredPosts: newPost
  });

  user.save();





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
}

connect();




//MAIN APPLICATION LOGIC. 

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const today = date.getDate()

const app = express();

const newMessage = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


// gets home content 
app.get('/', (req, res) => {
  res.render('home', {
    newMessage: newMessage,
    today: today,

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

//handles what happens when a user composes a new post. 
app.post('/compose', (req, res) => {

  const post = {
    title: req.body.title,
    message: req.body.message
  }
  newMessage.unshift(post);
  res.redirect('/')
});

app.get('/post/:postID', (req, res) => {
  const requestedPost = _.kebabCase(req.params.postID);

  newMessage.forEach(function (message) {
    if (requestedPost === _.kebabCase(message.title)) {
      res.render('post', {
        title: message.title,
        message: message.message,
        today: today
      })
    } else {
      console.log("not a match")
    };
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});