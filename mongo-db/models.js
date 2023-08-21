const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

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
    question: String,
    answer: String,
    category: String,
  });
  
  const Card = mongoose.model('Card', flashcardSchema)
  



  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
  });
  
  userSchema.plugin(passportLocalMongoose);
  
  const User = mongoose.model('User', userSchema)


  module.exports = {
    Post,
    Card,
    User
  };
  
  





