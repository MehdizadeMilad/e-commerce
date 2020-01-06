var express = require('express');
var router = express.Router();
const csrf = require('csurf');
const passport = require('passport');
const multer = require('multer')
const path = require('path');
const upload = multer({
    dest: 'public/uploads/',
    fileFilter: imageUploadFilterHandler
})




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
router.use('/*', isLoggedIn, (req, res, next) => {
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

    adminLayout.csrfToken = req.csrfToken();
    adminLayout.messages = req.flash('error').length > 0 ? req.flash('error') : req.flash('success');
    adminLayout.hasMessages = adminLayout.messages.length > 0;

    return res.render(viewPath + '/products/add', adminLayout);
});

router.post('/product/add', upload.single('image'), (req, res, next) => {

    if (!req.file || Object.keys(req.file).length === 0)
        return res.render(viewPath + '/product/add', adminLayoutConfig('عکس بازی چی شد پس؟'));

    const { title, image, catRadio, price, description } = req.body
    //some validation

    const newProduct = new Product();
    newProduct.title = title;
    newProduct.description = description;
    newProduct.imagePath = '/uploads/' + req.file.filename;
    newProduct.category = catRadio;
    newProduct.price = price;

    newProduct.save((err, result) => {
        if (err) return res.render(viewPath + '/products/add', adminLayoutConfig('بروز خطا'));
        return res.render(viewPath + '/products/add', adminLayoutConfig('بازی اضافه شد'));
    })
});

router.get('/product/edit/:id', (req, res, next) => {
    const productId = req.params.id;
    Product.findById(productId).then(product => {
        if (!product)
            return res.redirect('/admin/products');

        adminLayout.product = product;
        return res.render(viewPath + '/products/edit', adminLayout)
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
            return res.redirect('/admin/products');
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

function imageUploadFilterHandler(req, file, cb) {
    try {

        if (
            (path.extname(file.originalname) !== '.jpg')
            ||
            file.mimetype.split('/')[0] !== 'image'
        ) {
            return cb(new Error('فایلت شبیه عکس نیست که'));
        }
        if (file.size > 5000000)
            return cb(new Error('سایز عکس اگر زیاد باشه، سرعت لود صفحه می‌ره بالا و این خوب نیست'))
        return cb(null, true);

    } catch (error) {
        //TODO log
        return cb(new Error('یه مشکلی پیش اومده'));
    }
}

module.exports = router;