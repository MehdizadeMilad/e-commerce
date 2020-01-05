var express = require('express');
var router = express.Router();
const csrf = require('csurf')
const passport = require('passport')

const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');

const csrfProtection = csrf();
router.use(csrfProtection);

const adminLayoutConfig = (msg = '') => {
    return {
        layout: 'adminLayout',
        messages: [msg],
        hasMessages: msg.length > 0
    }
}
const adminLayout = {
    layout: 'adminLayout'
}

const viewPath = 'admin';
router.use('/', isLoggedIn, (req, res, next) => {
    next();
})

router.get('/dash', (req, res, next) => {
    return res.render(viewPath + '/index', adminLayout);
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
    return res.render(viewPath + '/orders/index', adminLayoutConfig());
    Order.find().then(orders => {
        if (!orders) throw new Error('fetching Orders failed.')
        const currentUser = req.user.orders = orders;

        return res.render(viewPath + 'orders/index');


    }).catch(err => {
        res.json(err)
    })
});

router.get('/products', (req, res, next) => {

    Product.find().then(products => {

        adminLayout.products = products;
        return res.render(viewPath + '/products/index', adminLayout);
    })
        .catch(err => res.send('Error'))
})

router.get('/product/add', (req, res, next) => {
    return res.render(viewPath + '/products/productAdd', adminLayout);
});
router.post('/product/add', (req, res, next) => {
    //parse body 
    // add new product
    return res.render(viewPath + '/products/productEdit', adminLayout);
});

router.get('/product/edit/:id', (req, res, next) => {
    const productId = req.params.id;
    Product.findById(productId).then(product => {
        if (!product)
            return res.redirect('/admin/products');

        adminLayout.product = product;
        return res.render(viewPath + '/products/productEdit', adminLayout)
    })
});

router.post('/product/edit', (req, res, next) => {

})

router.get('/product/delete/:id', (req, res, next) => {
    Product.findById(req.params.id).then(product => {
        product.available = false;
        product.modified_by = req.user;
        product.modified_at = Date.now();
        product.save().then(result => {
            return res.render(viewPath + '/products/index', adminLayout)
        })
    })
        .catch(err => {
            return res.render(viewPath + '/products/index', adminLayoutConfig('Error Happened'))
        })


})

function isLoggedIn(req, res, next) {

    //Passport helper
    if (req.isAuthenticated())
        if (req.user.role === 'admin') {
            console.log(req.user.email, req.user.role);
            return next()
        }

    res.redirect('/user/signin')
}

module.exports = router;