const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productSchema = Schema({
    // image title description price comments[]
    imagePath: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, maxlength: 250 },
    price: { type: Number, required: true, },
    available: { type: Boolean, default: true },
    modified_by: { type: Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});


module.exports = mongoose.model('Product', productSchema);