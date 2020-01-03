const Product = require('../models/product');
const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/shopping', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const description = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum sequi ea dolorem. Perferendis aperiam nisi porro soluta officia est ducimus, maiores voluptas qui ipsa sed temporibus odio neque deserunt blanditiis.'

const products = [
    new Product({
        imagePath: 'https://media.playstation.com/is/image/SCEA/playstation-4-slim-vertical-product-shot-01-us-07sep16?$native_t$',
        title: 'PS41',
        description: description,
        price: 120
    }),
    new Product({
        imagePath: 'https://media.playstation.com/is/image/SCEA/playstation-4-slim-vertical-product-shot-01-us-07sep16?$native_t$',
        title: 'PS42',
        description: description,
        price: 111
    }),
    new Product({
        imagePath: 'https://media.playstation.com/is/image/SCEA/playstation-4-slim-vertical-product-shot-01-us-07sep16?$native_t$',
        title: 'PS43',
        description: description,
        price: 123
    }),
    new Product({
        imagePath: 'https://media.playstation.com/is/image/SCEA/playstation-4-slim-vertical-product-shot-01-us-07sep16?$native_t$',
        title: 'PS44',
        description: description,
        price: 1233
    }),
    new Product({
        imagePath: 'https://media.playstation.com/is/image/SCEA/playstation-4-slim-vertical-product-shot-01-us-07sep16?$native_t$',
        title: 'PS45',
        description: description,
        price: 44
    }),
    new Product({
        imagePath: 'https://media.playstation.com/is/image/SCEA/playstation-4-slim-vertical-product-shot-01-us-07sep16?$native_t$',
        title: 'PS46',
        description: description,
        price: 444
    }),
    new Product({
        imagePath: 'https://media.playstation.com/is/image/SCEA/playstation-4-slim-vertical-product-shot-01-us-07sep16?$native_t$',
        title: 'PS47',
        description: description,
        price: 553
    }),
]


let done = 0;
for (let i = 0; i < products.length; i++) {
    products[i].save(function (err, result) {
        if (err) {
            console.log(err);
            exit();
        }
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}