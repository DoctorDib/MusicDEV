const stateKey = 'spotify_auth_state';
const request = require('request');
const spotify = require('../helpers/spotify_api.js');

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/welcome');
};

module.exports = function(passport){
    return {
        setRouting: function (router) {
            router.get('/', isLoggedIn, this.loggedIn);
            router.get('/welcome', this.landingPage);
            router.get('/logout', this.logout);
            router.get('/spotify_callback', this.spotifyCallback);
            router.get('/spotify_login', this.spotifyLogin);
            router.get('/spotify_refresh_token', this.spotifyRefresh);

            router.get('/ping', this.homeTest);

            router.post('/login', this.loginVal);
            router.post('/register', this.registerVal);
            router.post('/ping', this.homeTest);
        },
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
            spotify('new_user', {username: req.user.username}, ()=>{});
            // Checks if users spotify account is linked
            spotify('check_account', {username: req.user.username}, response => {
                if (response.response === "success") {
                    res.render('index/loggedIndex.ejs', {
                        title: 'musicDEV'
                    });
                } else {
                    res.redirect('/spotify_login');
                }
            });
        },

        loginVal: function (req, res) {
            passport.authenticate('local_login', (err, user) => {
                if (!user) return res.json({success: false, msg: 'Incorrect username or password'});
                if (err) return res.json({success: false, msg: 'Something went wrong, please try again'});
                req.logIn(user, (err) => {
                    if (err) return console.log('ERROR: ' + err);
                    res.json({success: true, user: user});
                });
            })(req, res);
        },

        // Register validation
        registerVal: function (req, res) {
            passport.authenticate('local_register', (err, user) => {
                if (err) return res.json({success: false, msg: 'Something went wrong, please try again'});
                if (!user) return res.json({success: false, msg: 'Username already exists!'});

                req.logIn(user, (err) => {
                    if (err) return console.log('ERROR: ' + err);
                    res.json({success: true, user: user});
                });
            })(req, res);
        },

        // Logging out of account
        logout: function(req, res){
            req.session.destroy(() => {
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
            let cookie = req.cookies ? req.cookies[stateKey] : null;
            let callback = spotify('callback', {
                code : req.query.code,
                state: req.query.state,
                storedState: cookie,
                temp_user: req.user.username
            });

            if(callback.response === 'failed'){
                res.redirect(callback.command);
            } else {
                res.clearCookie(callback.command);

                let authOptions = spotify('callbackV2', {
                    code : req.query.code,
                    state: req.query.state,
                    storedState: cookie,
                    temp_user: req.user.username
                });

                request.post(authOptions, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        let access_token = body.access_token,
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

                        spotify('set_get', {
                            data: data,
                            username: req.user.username,
                            access_token: access_token
                        }, () => {
                            res.redirect('/');
                        });
                    } else {
                        res.redirect('/login')
                    }
                });
            }
        }
    };
};
