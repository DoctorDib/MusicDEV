const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('../models/user');
const secret = require('../helpers/secretKeys');

module.exports = (passport) => {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    passport.use(
        new SpotifyStrategy(
            {
                clientID: secret.spotify.client_id,
                clientSecret: secret.spotify.client_secret,
                callbackURL: secret.spotify.spotify_callback
            },
            function(accessToken, refreshToken, expires_in, profile, done) {
                User.findOne({username: profile.id}, (err, user) => {
                    if(err) return done(err);

                    if (user) {
                        return done(null, user);
                    } else {
                        const newUser = new User();
                        newUser.id = profile.id;
                        newUser.username = profile.id;
                        newUser.name = profile.displayName;
                        newUser.newUser = true;
                        newUser.userImage = profile.photos[0];
                        newUser.spotify.access_token = accessToken;
                        newUser.spotify.refresh_token = refreshToken;

                        newUser.save((err) => {
                            if(err) return done(err);
                            return done(null, profile);
                        })
                    }

                });
            }
        )
    );
};
