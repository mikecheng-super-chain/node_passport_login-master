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

//show all products
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const products = await Product.find().lean()
                                            // .limit(5)
        const productNum = await Product.countDocuments()

        res.render('main.hbs', {
            listOfProducts: products,
            productNum: productNum,
            partials: {
                _header: 'partials/_header',
            }
        })
    } catch (error) {
        res.json({message: error})
        
    }
})

//put all selected product to export cart
router.post('/', upload.none(), async (req, res) => {
    try {
        const productIds = req.body.id
        req.session.chosen = productIds
        res.redirect('/export')
    } catch (error) {   
        res.json({ message: error })
    }
})


//for debug use
router.get('/:productId', ensureAuthenticated, async (req, res) => {
    try {
        // const product = await Product.find({_id :req.params.productId})
        const product = await Product.findById(req.params.productId)
        // console.log(product.oriPrice)
        res.render('product', {
            id: product._id,
            name: product.name,
            price: product.price,
            // oriPrice: product.oriPrice,
            imgsURL: product.imgsURL,
        })
        // res.json(product)
    } catch (err) {
        console.log(err)
        res.json({message: err})
    }
   
})
//for debug
router.post('/:productId', upload.none(), async (req, res) => {

    try {
        const name = req.body.name
        const id = req.body.id
        // console.log(name, id)
        const outputProductJSON = await Product.find({"name": name})
        // res.json(outputProductJSON)

        const file = './download/output.json';
        fs.writeFileSync(file, outputProductJSON, (err) =>{
            if (err) throw err
            console.log('saved file')

        })
        res.download(file);
        
    } catch (err) {
        console.log(err)
        res.json({message: err})
    }
   
})

module.exports = router