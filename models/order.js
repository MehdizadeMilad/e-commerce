const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const orderStatus = {
    'received': 'ثبت شده',
    'rejected': 'رد شده',
    'approaved': 'تأیید شده',
    'sent': 'ارسال شده',
    'done': 'تحویل داده شد'
}
Object.freeze(orderStatus);

const ordertSchema = Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    cart: { type: Object, required: true },
    status: {
        type: String,
        enum: [
            orderStatus.received,
            orderStatus.rejected,
            orderStatus.approaved,
            orderStatus.sent,
            orderStatus.done
        ],
        default: orderStatus.received
    },
    modified_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    // paymentId: { type: String, required: true }

}, { timestamps: true });




module.exports.orderStatus;
module.exports = mongoose.model('Order', ordertSchema);