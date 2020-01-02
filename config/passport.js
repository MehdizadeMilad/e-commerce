const passport = require('passport')
const User = require('../models/user')
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    //! Validations goes here ...
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail()
    req.checkBody('password', 'Invalid password').notEmpty().isLength({ min: 4, max: 70 })
    req.checkBody('password2', 'Passwords doesn\'t match').equals(req.body.password);
    let errors = req.validationErrors();

    if (errors) {
        let messages = [];
        errors.forEach(err => {
            messages.push(err.msg)
        });
        return done(null, false, req.flash('error', messages))
    }

    User.findOne({ 'email': email }, function (err, user) {
        if (err)
            return done(err);
        if (user) {
            // no success, user already exist!
            return done(null, false, { message: 'Email is already in use.' })
        }
        const newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function (err, result) {
            if (err) return done(err);
            return done(null, newUser);
        })
    })
}))

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    badRequestMessage: 'bad request detected',
    passReqToCallback: true
}, function (req, email, password, done) {

    //! Validations
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'password required').notEmpty().isLength({ min: 4 })

    if (req.validationErrors()) {
        let messages = [];
        req.validationErrors().forEach(i => messages.push(i.msg));
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({ 'email': email }, function (err, user) {
        if (err) return done(null, false, { message: `login failed!\n ${err}` });
        if (!user) return done(null, false, { message: 'user not found' });
        if (!user.validPassword(password)) return done(null, false, { message: 'wrong password' })

        return done(null, user);
    });
}));