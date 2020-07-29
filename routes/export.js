const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const multer = require('multer')
var upload = multer()
const fs = require('fs')
// const passport = require('passport');
// const User = require('../models/User');
// const UserProduct = require('../models/UserProduct');
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
        const userProductArr = []
        var productArr = []
        for (pid of req.session.cart) {
            var pt = await Product.findById(pid).lean()
            productArr.push(pt)
        }
        const productNum = productArr.length
        const productInCart = productArr
        res.render('checkout.hbs', {
            titleName: 'Export', 
            listOfProducts: productInCart,
            productNum: productNum,
        })
    
    } catch (error) {
        res.json({ message: error })
    }
})

function isInclude(arr, searchTerm) {
    for(var i = 0; i<arr.length; ++i){
        if(arr[i].productId === searchTerm|| arr[i].productName === searchTerm){
            return i
        }
    }
    return false
}

//export button
router.post('/', upload.none(), async (req, res) => {
    try {
        const productIds = req.body.id
        const markupPercent = req.body.markup
        const exportArr = []
        var addNew = false
        
        for (var i = 0; i < productIds.length; ++i) {
            var pid = productIds[i]
            // console.log(pid)
            var pt = await Product.findById(pid)
            pt.price *= (1 + markupPercent[i]/100)
            if (isInclude(req.user.listOfProducts, pid) === false) {
                const map = new Map([
                    ['productId', pid],
                    ['productName', pt.name]
                ])
                // console.log(map)
                req.user.listOfProducts.push(map)
                // console.log(map)
                // console.log(req.user.listOfProducts)
                addNew = true
            }
            exportArr.push(pt)
        }
        // if there is new product to add to the user, save the change, else do nothing
        if (addNew) {
            req.user.save()
        }
        // console.log(req.user.listOfProducts)
        var outputJson = JSON.stringify(exportArr)
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


//remove button on the export page
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