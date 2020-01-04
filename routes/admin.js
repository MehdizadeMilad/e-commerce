var express = require('express');
var router = express.Router();
const csrf = require('csurf')
const passport = require('passport')

const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');

const csrfProtection = csrf();
router.use(csrfProtection);

const adminLayoutConfig = { layout: 'adminLayout' };
const viewPath = 'admin';

router.get('/dash', (req, res, next) => {
    return res.render(viewPath + '/index', adminLayoutConfig)
});


router.get('/in', (req, res, next) => {
    //TODO login page
    let messages = req.flash('error'); // Passport messages stored here.
    return res.render(viewPath + '/login', {
        layout: false,
        csrfToken: req.csrfToken(),
        messages: messages,
        hasMessages: messages.length > 0
    }
    );
});

router.post('/in', (req, res, next) => {
    //TODO login post
    return res.redirect('/admin/dash')
});

router.get('/out', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

router.get('/orders', (req, res, next) => {
    return res.render(viewPath + '/orders/index', adminLayoutConfig);
    Order.find().then(orders => {
        if (!orders) throw new Error('fetching Orders failed.')
        const currentUser = req.user.orders = orders;

        return res.render(viewPath + 'orders/index');


    }).catch(err => {
        res.json(err)
    })
});

router.get('/products', (req, res, next) => {

    Product.find({}).then(products => {
        return res.render(viewPath + '/products/index', { layout: 'adminLayout', products: products });
    })
})

function isLoggedIn(req, res, next) {

    //Passport helper
    if (req.isAuthenticated())
        if (req.user.role === 'admin')
            return next()

    res.redirect('/user/signin')
}

module.exports = router;