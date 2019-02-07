const secret = require('../config/config');

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // FAILED
    res.redirect('/welcome');
};

module.exports = function(passport){
    return {
        setRouting: function (router) {
            router.get('/', ensureAuthenticated, this.loggedIn);
            router.get('/welcome', this.landingPage);
            router.get('/logout', this.logout);

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
        },

        // Logging out of account
        logout: function(req, res){
            req.logout();
            res.redirect('/welcome');
        },

        homeTest: function(req, res){
            console.log("Pong")
        },
    };
};
