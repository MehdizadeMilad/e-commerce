const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs')

const userSchema = new Schema({
    email: { type: String, required: true, unique: true, minlength: 6, maxlength: 25 },
    // userName: { type: String, default: null, unique: true, minlength: 4, maxlength: 25 },
    fullName: { type: String, default: null, minlength: 2, maxlength: 100 },
    tel: { type: String, minlength: 4, maxlength: 25 },
    mobile: { type: String, minlength: 10, maxlength: 15 }, // maxlength is 13 for iran.
    address: { type: String, minlength: 5, maxlength: 250 }, // maxlength is 13 for iran.
    postalCode: { type: Number, minlength: 8, maxlength: 25 },
    password: { type: String, required: true, minlength: 6, maxlength: 70 },
    role: { type: String, enum: ['user', 'ranger'], default: 'user' },
    updated_at: { type: Date, default: null },
    created_at: { type: Date, default: Date.now }
});

userSchema.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
}
userSchema.methods.validPassword = function (pass) {
    return bcrypt.compareSync(pass, this.password);
}

module.exports = mongoose.model('User', userSchema)