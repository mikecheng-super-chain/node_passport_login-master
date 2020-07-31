const mongoose = require('mongoose');

const UserProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    displayName:{
        type: String,
    }
})

module.exports = mongoose.model('UserProduct', UserProductSchema)