var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = (passport) => {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use('local_register', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    (req, username, password, done) => {
        process.nextTick(() => {
            User.findOne({ 'username' :  username }, (err, user) => {
                if (err)
                    return done(err);

                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {

                    var newUser = new User();

                    newUser.username  = username;
                    newUser.password = newUser.generateHash(password);
                    newUser.picture = '../client/src/img/blank_pic.jpg';
                    newUser.spotify = {
                        user_id: "",
                        spotify_token : "",
                        spotify_refresh : "",
                        playlists: []
                    }

                    newUser.save((err) => {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

    passport.use('local_login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    }, (req, username, password, done) => {
        User.findOne({ 'username' :  username }, (err, user) => {
            console.log(err)
            if (err)
                return done(err);

            if (!user)
                return done(true, false);

            if (!user.validPassword(password))
                return done(true, false);

            return done(false, user);
        });
    }));
};
