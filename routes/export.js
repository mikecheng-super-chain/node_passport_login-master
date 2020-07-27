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

// receive product code from each page, try to add them to the cart
router.get('/', ensureAuthenticated, async (req, res) =>{
    try {
        if (!req.session.cart) {
            req.session.cart = []
        }
        if (req.session.chosen != null) {
            var chosen = req.session.chosen
            req.session.chosen = null

            for (pt of chosen) {
                if (req.session.cart.includes(pt) === false) {
                    req.session.cart.push(pt)
                }
            }
        }

        var productArr = []
        for (pid of req.session.cart) {
            var pt = await Product.findById(pid).lean()
            productArr.push(pt)
        }

        const productNum = productArr.length
        const productInCart = productArr
        res.render('exportCheckout.hbs', {
            listOfProducts: productInCart,
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



router.post('/remove/:pid', ensureAuthenticated, async (req, res) => {
    try {
        //see if the product is in the cart, if not redirect the user to the export cart
        //else return the index of the product in the cart
        const index = req.session.cart.findIndex((element) => element === req.params.pid)
        if(index != -1){
            req.session.cart.splice(index, 1)
        }
        res.redirect('/export')
    } catch (error) {
        res.json({
            message: error
        })
    }
})

module.exports = router