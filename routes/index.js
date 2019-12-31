var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');

var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function (err, docs) {
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMessage: successMsg, noMessages: !successMsg });
  });
});


router.get('/details/:id', (req, res, next) => {
  let productId = req.params.id;
  let product = Product.findById(productId, (err, product) => {
    if (err) return res.redirect('/');
    res.render('shop/details', { product: product });
  })
})


router.get('/add-to-cart/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    req.flash('success', 'Cart Updated');
    res.redirect('/');
  });
});

router.get('/reduce/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId); https://www.hamshahrionline.ir/rest/postCommentVote
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res, next) {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', { products: null });
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

router.get('/checkout', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout',
    {
      total: cart.totalPrice,
      errMsg: errMsg,
      noError: !errMsg,
      userName: req.user.name
    });
});

router.post('/checkout', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }

  var cart = new Cart(req.session.cart);

  let order = new Order({
    user: req.user,
    cart: cart,
    address: req.body.address,
    name: req.body.name
  });


  order.save((err, result) => {
    if (err) {
      req.flash('error', 'Checkout Failed!');
      res.redirect(req.session.oldUrl)
    }
    req.flash('success', 'Successfully bought product!');
    req.session.cart = null;
    res.redirect('/');
  })

  // var stripe = require("stripe")(
  //     "sk_test_fwmVPdJfpkmwlQRedXec5IxR"
  // );

  //     stripe.charges.create({
  //         amount: cart.totalPrice * 100,
  //         currency: "usd",
  //         source: req.body.stripeToken, // obtained with Stripe.js
  //         description: "Test Charge"
  //     }, function(err, charge) {
  //         if (err) {
  //             req.flash('error', err.message);
  //             return res.redirect('/checkout');
  //         }
  //         var order = new Order({
  //             user: req.user,
  //             cart: cart,
  //             address: req.body.address,
  //             name: req.body.name,
  //             paymentId: charge.id
  //         });
  //         order.save(function(err, result) {
  //             req.flash('success', 'Successfully bought product!');
  //             req.session.cart = null;
  //             res.redirect('/');
  //         });
  //     }); 
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}

