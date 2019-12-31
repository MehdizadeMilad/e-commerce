const mongoose = require('mongoose')
const Schema = mongoose.Schema;

//! a User orders Product(s)
//! User to Products 


const ordertSchema = Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    cart: { type: Object, required: true },
    address: { type: String, required: true },
    name: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    modified_at: { type: Date, default: null },
    modified_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    // paymentId: { type: String, required: true }

});


module.exports = mongoose.model('Order', ordertSchema);