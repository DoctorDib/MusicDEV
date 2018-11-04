const spotify = require('../helpers/spotify_api.js');

module.exports = function(){
    return {
        setRouting: function (router) {
            router.get('/initialLoad', this.initialLoad);
            router.get('/currentSong', this.currentSong);
        },

        initialLoad: function(req, res) {
            spotify('new_user', {username: req.user.username}, () => {
                spotify('refresh', {username: req.user.username, token: req.user.spotify.refresh_token}, () => {
                    res.json({
                        name: req.user.username,
                        username: req.user.spotify.user_id,
                        pic: req.user.picture
                    });
                });
            });
        },
        currentSong: function(req, res) {
            spotify("grabCurrentMusic", {username: req.user.username}, data => {
                res.json({
                    isPlaying: data.is_playing,
                    song: data.item.name,
                    artist: data.item.artists[0].name
                });
            });
        }
    };
};
