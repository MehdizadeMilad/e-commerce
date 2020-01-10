var express = require('express');
var router = express.Router();
const csrf = require('csurf')
var Cart = require('../models/cart');

const csrfProtection = csrf();
router.use(csrfProtection);

var Product = require('../models/product');
var Order = require('../models/order');
const Message = require('../models/messages');

/* GET home page. */
router.get('/', function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function (err, docs) {
    res.render('shop/index', { title: 'Shopping Cart', products: docs, successMessage: successMsg, noMessages: !successMsg });
  });
});

router.get('/details/:title', (req, res, next) => {
  let productTitle = req.params.title;
  let product = Product.findOne({ title: productTitle }, (err, product) => {
    if (err || !product) return res.redirect('/');

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
    req.flash('success', 'کالا به سبد خرید اضافه شد');
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
      csrfToken: req.csrfToken(),
      total: cart.totalPrice,
      errMsg: errMsg,
      noError: !errMsg,
      user: req.user
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
    modified_by: req.user
  });

  order.save((err, result) => {
    if (err) {
      req.flash('error', 'Checkout Failed!');
      return res.redirect('/user/profile')
    }
    req.flash('success', 'سفارش شما با موفقیت ثبت شد. با شما تماس می‌گیریم');
    req.session.cart = null;
    return res.redirect('/');
  })
});

router.get('/contactUs', (req, res, next) => {

  return res.render('contactUs', { csrfToken: req.csrfToken() });
})

router.post('/contactUs', (req, res, next) => {
  const { name, email, subject, message } = req.body;

  let newMessage = new Message();
  newMessage.name = name;
  newMessage.email = email;
  newMessage.subject = subject;
  newMessage.message = message;
  newMessage.save((err, result) => {
    if (err)
      return res.render('contactUs', { message: 'بروز خطا، لطفا با شماره تلفن تماس بگیرید' })
    return res.render('contactUs', { message: 'پیام شما ارسال شد' });
  })
})




function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}


module.exports = router;