const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const multer = require('multer')
var upload = multer()
const fs = require('fs')
const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');

router.get('/', ensureAuthenticated, async (req, res) =>{
    try {
        res.render()
    } catch (error) {
        
    }
})