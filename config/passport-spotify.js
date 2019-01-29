const SpotifyStrategy = require('passport-spotify').Strategy;
const passportRefreshToken = require('passport-oauth2-refresh');
const User = require('../models/user');
const secret = require('../helpers/secretKeys');

module.exports = (passport) => {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    let strategy = new SpotifyStrategy(
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
                    let newUser = new User();
                    newUser.id = profile.id;
                    newUser.username = profile.id;
                    newUser.displayName = profile.displayName;
                    newUser.newUser = true;
                    newUser.photos = profile.photos;

                    newUser.spotify.access_token = accessToken;
                    newUser.spotify.refresh_token = refreshToken;

                    newUser.playlistOptions.id = '';
                    newUser.playlistOptions.is_private = true;
                    newUser.playlistOptions.name = 'MusicDEV Recommendations';
                    newUser.playlistOptions.is_active = false;

                    newUser.save((err) => {
                        if(err) return done(err);
                        return done(null, profile);
                    })
                }
            });
        }
    );

    passport.use(strategy);
    passportRefreshToken.use(strategy);
};
