const mongoose = require('mongoose');
const UserProduct = require('./UserProduct');

const AdminUserSchema = new mongoose.Schema({
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
    type: [UserProduct.UserProductSchema],
  }
});

const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

module.exports = AdminUser;
