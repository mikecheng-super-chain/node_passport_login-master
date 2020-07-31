const mongoose = require('mongoose')

const SellerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        // required: true
    },
    URL: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
})

const ReviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        required: true
    },
    word: {
        type: String,
        required: true
    },
})

const DescriptionSchema = mongoose.Schema({
    shortDes:{
        type: String,
    },
    picHtml: {
        type: String,
    },
    desHtml: {
        type: String,
    },
})

const ProductSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    oriPrice: {
        type: Number,
        // required: true
    },
    URL:{
        type: String,
        required: true
    },
    salesNum: {
        type: Number,
        // required: true
    },
    deliveryMtd:{
        type: String,
        required: true
    },
    imgsURL:{
        type: [String],
        required: true
    },
    variants: {
        type: [String],
        // required: true
    },
    breadcrumb: {
        type: [String],
        required: true
    },
    reviews: {
        type: [ReviewSchema],
        // required: true
    },
    description: {
        type: [DescriptionSchema],
        // required: true
    },
    seller: {
        type: [SellerSchema],
        required: true
    },
})

module.exports = mongoose.model('Products', ProductSchema)