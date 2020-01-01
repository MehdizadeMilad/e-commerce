var express = require('express');
var router = express.Router();
const csrf = require('csurf')
const passport = require('passport')

const Order = require('../models/order');
const Cart = require('../models/cart');

const csrfProtection = csrf();
router.use(csrfProtection);


//!! Logged in era
router.get('/profile', isLoggedIn, (req, res, next) => {

    let messages = req.flash('success'); //passport messages are stored on 'error'

    Order.find({ user: req.user }, (err, orders) => {
        if (err) return res.write('error loading orders')
        let cart;
        orders.forEach(o => {
            //Cart is saved in db as JSON
            cart = new Cart(o.cart);
            o.items = cart.generateArray();
        });

        let currentUser = req.user;
        currentUser.orders = orders;

        return res.render('user/profile', {
            user: currentUser,
            orders: orders,
            messages: messages,
            hasMessages: messages.length > 0
        });
    });
})

router.get('/signout', isLoggedIn, (req, res, next) => {
    req.logout();
    res.redirect('/');
})


//! Route Grouping! the following routes will be affected by this middleware.
// router.use('/', notLoggedIn, (req, res, next) => {
//     next();
// })

router.get('/signup', (req, res, next) => {
    let messages = req.flash('error'); //passport messages are stored on 'error'

    res.render('user/signup', {
        csrfToken: req.csrfToken(),
        messages: messages,
        hasMessages: messages.length > 0
    })
});

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true,
    successFlash: true,
}), handleAuthenticationRedirection);


router.get('/signin', (req, res, next) => {
    console.log('fa-youtube-play');
    let messages = req.flash('error'); // Passport messages stored here.
    res.render('user/signin', {
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    })
})

router.post('/signin', passport.authenticate('local.signin', {
    // successRedirect: '/user/profile', //! we are going to handle it manually
    failureRedirect: '/user/signin',
    failureFlash: true,
    passReqToCallback: true
}), handleAuthenticationRedirection);


//! if authentication succeeded:
function handleAuthenticationRedirection(req, res, next) {
    const oldUrl = req.session.oldUrl
    if (oldUrl) {
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    }
    else {
        res.redirect('/user/profile');
    }
}


function isLoggedIn(req, res, next) {

    console.log('*'.repeat(100))
    //Passport helper
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/user/signin')
}

function notLoggedIn(req, res, next) {

    //Passport helper
    if (!req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}


module.exports = router;