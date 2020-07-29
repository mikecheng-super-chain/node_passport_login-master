const mongoose = require('mongoose');
// const UserProduct = require('../models/UserProduct');
const { mapReduce } = require('../models/UserProduct');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  listOfProducts:{
    type: [Map],
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
