let generateRandomString = function(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const stateKey = 'spotify_auth_state';
const state = generateRandomString(16);
const User = require('../models/user');
const request = require('request');
const mongoose = require('../helpers/mongoose');
const spotify = require('../helpers/spotify_api.js');

module.exports = function(passport){
    return {
        setRouting: function(router){
            router.get('/', isLoggedIn, this.loggedIn);
            router.get('/welcome', this.landingPage);
            router.get('/register', this.registerPage);
            router.get('/login', this.loginPage);
            router.get('/logout', this.logout);
            router.get('/spotify_callback', this.spotifyCallback);
            router.get('/spotify_login', this.spotifyLogin);
            router.get('/spotify_refresh_token', this.spotifyRefresh);

            router.get('/ping', this.homeTest);

            router.post('/login', this.loginVal);
            router.post('/register', this.registerVal);
            router.post('/ping', this.homeTest);
        },

        // Main landing page (not logged in).
        landingPage: function(req, res){
            res.render('index/landingIndex.ejs', {
                title: 'musicDEV'
            });
        },

        loggedIn: function(req, res){
            res.render('index/loggedIndex.ejs', {
                title: 'musicDEV'
            });
        },

        // Login page
        loginPage: function(req, res){
            res.render('index/loginIndex.ejs', {
                title: 'Login'
            });
        },

        // Login validation
        loginVal: passport.authenticate('local_login', {
            successRedirect : '/',
            failureRedirect : '/login',
            failureFlash : true
        }),

        // Register page
        registerPage: function(req, res){
            res.render('index/registerIndex.ejs', {
                title: 'musicDEV'
            })
        },

        // Register validation
        registerVal: passport.authenticate('local_register', {
            successRedirect : '/login',
            failureRedirect : '/register',
            failureFlash : true
        }),

        // Logging out of account
        logout: function(req, res){
            req.session.destroy(function (err) {
            res.redirect('/welcome');
          });
        },

        spotifyRefresh: function(req, res){
            res.send(spotify('refresh', {
                token: req.query.refresh_token
            }));
        },

        // Logging into spotify account
        spotifyLogin: function(req, res){
            let state = generateRandomString(16);
            res.cookie(stateKey, state);

            res.redirect(spotify('login', {
                state: state
            }));
        },

        homeTest: function(req, res){
            console.log("Pong")

            /*res.render('playground.jsx', {
             title: 'musicDEV'
             });*/
        },

        spotifyCallback: function(req, res){
            var cookie = req.cookies ? req.cookies[stateKey] : null;
            var callback = spotify('callback', {
                code : req.query.code,
                state: req.query.state,
                storedState: cookie,
                temp_user: req.user.username
            });

            if(callback.response === 'failed'){
                res.redirect(callback.command);
            } else {
                res.clearCookie(callback.command);

                var authOptions = spotify('callbackV2', {
                    code : req.query.code,
                    state: req.query.state,
                    storedState: cookie,
                    temp_user: req.user.username
                });

                request.post(authOptions, function(error, response, body) {
                    console.log("ping");
                    if (!error && response.statusCode === 200) {
                        var access_token = body.access_token,
                            refresh_token = body.refresh_token;

                        var options = {
                            url: 'https://api.spotify.com/v1/me',
                            headers: { 'Authorization': 'Bearer ' + access_token },
                            json: true
                        };

                        let data = {
                            "access_token": access_token,
                            "refresh_token": refresh_token
                        };

                        var test = spotify('set_get', {
                            data: data,
                            username: req.user.username,
                            access_token: access_token
                        }).then(function(data){
                            res.render('index.jsx', {
                                title: 'musicDEV',
                                pic: data.picture,
                                playlist: ["one", "two", "three"]
                            });
                        });
                    } else {
                        console.log(error)
                        res.redirect('/#failed')
                    }
                });
            }
        }
    }

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/welcome');
    }
};
