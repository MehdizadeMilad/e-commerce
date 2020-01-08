const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const messageSchema = Schema({
    from: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    to: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, require: true },
    email: { type: String, require: true },
    subject: { type: String, require: true },
    message: { type: String, require: true, maxLength: 250 },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);