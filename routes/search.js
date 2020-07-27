const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const multer = require('multer')
var upload = multer()
const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');


//for search page
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const q = req.query.q

        if(q === ''){
            res.redirect('/products')
            return
        }

        const results = await Product.find({
            $or: [{
                    name: new RegExp(q, 'i')
                },
                {
                    "seller.name": new RegExp(q, 'i')
                }
            ]
        }).lean()
        const productNum = results.length
        res.render('main.hbs', {
            listOfProducts: results,
            productNum: productNum,
            partials:{_header: 'partials/_header'}
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

router.post('/', upload.none(), async (req, res) => {
    try {
        const productIds = req.body.id
        req.session.chosen = productIds
        res.redirect('/export')
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//for filtering by categort
router.get('/category/:ctgname', ensureAuthenticated, async (req, res) => {

    try {
        const c = req.params.ctgname
        const encodedC = encodeURIComponent(c)
        const results = await Product.find({
            'breadcrumb.0': new RegExp(encodedC, 'i')
        }).lean()
        const productNum = results.length
        res.render('main.hbs', {
            listOfProducts: results,
            productNum: productNum,
            partials: {
                _header: 'partials/_header'
            }
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//post all selected product from category page to export cart, redirect to export page 
router.post('/category/:ctgname', upload.none(), async (req, res) => {
    try {
        const productIds = req.body.id
        req.session.chosen = productIds
        res.redirect('/export')
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//for filtering shipping option
router.get('/ship', ensureAuthenticated, async (req, res) => {
    try {
        var from = req.query.shipFrom
        var to = req.query.shipTo
        // console.log(from)
        // console.log(to)
        var results
        if (from === 'any' && to === 'any') {
            results = await Product.find().lean()
        } else if (from === 'any') {
            results = await Product.find({
                shipTo: new RegExp(to, 'i')
            }).lean()
        } else if (to === 'any') {
            results = await Product.find({
                shipFrom: new RegExp(to, 'i')
            }).lean()
        } else {
            results = await Product.find({
                $and: [{
                        shipFrom: new RegExp(from, 'i')
                    },
                    {
                        shipTo: new RegExp(to, 'i')
                    }
                ]
            }).lean()
        }

        const productNum = results.length
        res.render('main.hbs', {
            listOfProducts: results,
            productNum: productNum,
            partials: {
                _header: 'partials/_header'
            }
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//post all selected product from ship page to export cart, redirect to export page 
router.post('/ship/', upload.none(), async (req, res) => {
    try {
        const productIds = req.body.id
        req.session.chosen = productIds
        res.redirect('/export')
    } catch (error) {
        res.json({
            message: error
        })
    }
})


module.exports = router