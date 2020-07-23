const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const multer = require('multer')
var upload = multer()
const fs = require('fs')
const session = require('express-session');
const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');

function addToCart(pid, cart) {
    
}

router.get('/', async (req, res) =>{
    try {
        
        var result = req.session.result
        req.session.result = null
        const productNum = result.length
        var arr = []
        res.render('exportCheckout.hbs', {
            listOfProducts: result,
            productNum: productNum,
        })
    } catch (error) {
        res.json({ message: error })
    }
})

router.post('/', upload.none(), async (req, res) => {
    try {
        const productIds = req.body.id
        const markupPercent = req.body.markup
        const arr = []
        for (var i = 0; i < productIds.length; ++i) {
            var pid = productIds[i]
            var pt = await Product.findById(pid)
            // console.log(pt.price)
            pt.price *= (1 + markupPercent[i]/100)
            // console.log(pt.price)
            arr.push(pt)
        }
        
        var outputJson = JSON.stringify(arr)
        const file = './download/output.json'
        fs.writeFileSync(file, outputJson, (err) => {
            if (err) throw err
            console.log('saved file')
        })
        res.download(file)
    } catch (error) {
        res.json({
            message: error
        })
    }
})
module.exports = router