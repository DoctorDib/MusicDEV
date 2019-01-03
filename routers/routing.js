const stateKey = 'spotify_auth_state';
const request = require('request');
const spotify = require('../helpers/spotify_api.js');

const isLoggedIn = (req, res, next) => {
    /*if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/welcome');*/
    return next();
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

            if(req.cookies.spotify){
                res.render('index/loggedIndex.ejs', {
                    title: 'musicDEV'
                });
            } else {
                res.redirect('/welcome')
            }

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
            req.session.destroy(() => {
                res.cookie('spotify', '', {maxAge: Date.now()}); // Desroying the cookie
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
            });

            if(callback.response === 'failed'){
                res.redirect(callback.command);
            } else {
                res.clearCookie(callback.command);

                let authOptions = spotify('callbackV2', {
                    code : req.query.code,
                    state: req.query.state,
                    storedState: cookie,
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

                        spotify('getMe', {access_token: data.access_token}, (accountResponse) => {
                            spotify('set_get', {
                                data: data,
                                access_token: access_token,
                                username: accountResponse.username
                                }, () => {
                                    let data = {
                                        access_token: access_token,
                                        username: accountResponse.username,
                                        name: accountResponse.name,
                                        image: accountResponse.image,
                                    }
                                    let maxAge = (60000 * 1440) // 6000ms to 1 minute => 24 hours
                                    res.cookie('spotify', JSON.stringify(data), {maxAge: maxAge});
                                    res.redirect('/');
                                });
                        });
                    } else {
                        res.redirect('/'); // Redirecting to homepage, if not loged in, then the user will be
                        // redirected to the landing page.
                    }
                });
            }
        }
    };
};
