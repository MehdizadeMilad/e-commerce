var express = require('express');
var router = express.Router();
const csrf = require('csurf')
const passport = require('passport')

const Order = require('../models/order');
const Cart = require('../models/cart');

const csrfProtection = csrf();
router.use(csrfProtection);

const User = require('../models/user')


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


router.post('/profile/update', isLoggedIn, (req, res, next) => {

    const { fullName, address, postalCode, tel, mobile } = req.body

    //some validation 

    User.findById(req.user._id).then(user => {
        user.fullName = fullName;
        user.address = address;
        user.postalCode = postalCode;
        user.tel = tel;
        user.mobile = mobile;
        user.save((err, result) => {
            if (err) throw new Error('Error in password update');

            req.flash('success', 'مشخصات شما بروزرسانی شد');
            return res.redirect('/checkout')
        })
    })
        .catch(err => {
            req.flash('success', 'بروز خطا، لطفا بعدا امتحان کنین')
            res.redirect('/user/profile')
        })
});


router.get('/profile/edit', isLoggedIn, (req, res, next) => {
    let messages = req.flash('profileEditMessages');
    res.render('user/profileEdit', {
        user: req.user,
        csrfToken: req.csrfToken(),
        messages: messages,
        hasMessages: messages.length > 0
    });
})


router.post('/profile/edit/changePassword', isLoggedIn, (req, res, next) => {

    let enteredCurrentPassword = req.body.currentPassword;

    if (req.user.validPassword(enteredCurrentPassword)) {
        console.log('valid');
    }
    else {
        req.flash('profileEditMessages', 'رمزعبور معتبر نیست');
        return res.redirect('/user/profile/edit');
    }

    req.checkBody('newPassword', 'رمزعبور حداقل ۴ کارکتر باید باشه').notEmpty().isLength({ min: 4, max: 70 })
    req.checkBody('newPasswordConfirm', 'رمزعبور جدیدت مطابقت ندارن، دوباره تلاش کن لطفا').equals(req.body.newPassword);
    let errors = req.validationErrors();

    if (errors) {
        let messages = [];
        errors.forEach(err => {
            messages.push(err.msg)
        });

        req.flash('profileEditMessages', messages);
        return res.redirect('/user/profile/edit');
    }

    const currentUser = req.user;
    User.findById(currentUser._id).then(user => {
        user.password = user.encryptPassword(req.body.newPassword);
        user.updated_at = Date.now()
        user.save(function (err, result) {
            if (err) {
                throw new Error('Error in password update');
            }
            req.flash('profileEditMessages', 'رمز عبور بروزرسانی شد');
            res.redirect('/user/profile/edit')
        })
    }).catch(err => {
        req.flash('profileEditMessages', [' بروز خطا لطفا بعدا امتحان کنید یا اگر عجله دارید، با ما تماس بگیرین']);
        return res.redirect('/user/profile/edit');
    })
});



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