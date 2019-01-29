const stateKey = 'spotify_auth_state';
const request = require('request');
const spotify = require('../helpers/spotify_api.js');
const secret = require('../helpers/secretKeys');

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // FAILED
    res.redirect('/welcome');
};

const generateRandomString = function(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

module.exports = function(passport){
    return {
        setRouting: function (router) {
            router.get('/', ensureAuthenticated, this.loggedIn);
            router.get('/welcome', this.landingPage);
            router.get('/logout', this.logout);
            //router.get('/spotify_callback', this.spotifyCallback);
            //router.get('/spotify_login', this.spotifyLogin);
            //router.get('/spotify_refresh_token', this.spotifyRefresh);

            router.get('/auth/spotify', this.spotifyAuth);
            router.get('/spotify_callback', this.spotifyAuthCallback, this.spotifyAuthSuccess);

            router.get('/ping', this.homeTest);
            router.post('/ping', this.homeTest);
        },

        spotifyAuthSuccess: function (req, res) {
            res.redirect('/');
        },

        spotifyAuth: passport.authenticate('spotify', {
            scope: secret.spotify.scopes,
            showDialog: true
        }),

        spotifyAuthCallback: passport.authenticate('spotify', {
            failureRedirect: '/welcome',
            failureFlash: true,
        }),

        /**
         * Pages
         */
        // Main landing page (not logged in).
        landingPage: function (req, res) {
            res.render('index/landingIndex.ejs', {
                title: 'musicDEV'
            });
        },

        loggedIn: function (req, res) {
            res.render('index/loggedIndex.ejs', {
                title: 'musicDEV'
            });

            /*if(req.cookies.spotify){
                res.render('index/loggedIndex.ejs', {
                    title: 'musicDEV'
                });
            } else {
                res.redirect('/welcome')
            }*/

            // Checks if users spotify account is linked
            /*spotify('check_account', {username: req.user.username}, response => {
                if (response.response === "success") {
                    res.render('index/loggedIndex.ejs', {
                        title: 'musicDEV'
                    });
                } else {
                    res.redirect('/spotify_login');
                }
            });*/
        },

        // Logging out of account
        logout: function(req, res){
            req.logout();
            res.redirect('/welcome');

            /*req.session.destroy(() => {
                res.cookie('spotify', '', {maxAge: Date.now()}); // Desroying the cookie
                res.redirect('/welcome');
            });*/
        },

        homeTest: function(req, res){
            console.log("Pong")

            /*res.render('playground.jsx', {
             title: 'musicDEV'
             });*/
        },
    };
};
