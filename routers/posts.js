const spotify = require('../helpers/spotify_api.js');
const mongoose = require('../helpers/mongoose');
const MongoClient = require('mongodb').MongoClient;

const trainer = require('../helpers/frontTraining');

module.exports = function(){
    return {
        setRouting: function (router) {
            router.get('/initialLoad', this.initialLoad);
            router.get('/currentSong', this.currentSong);
            router.get('/grabPlaylistGenre', this.grabPlaylistGenre);
        },

        initialLoad: function(req, res) {
<<<<<<< HEAD
            spotify('new_user', {username: req.user.username}, () => {
                spotify('refresh', {username: req.user.username, token: req.user.spotify.refresh_token}, () => {
                    res.json({
                        name: req.user.username,
                        username: req.user.spotify.user_id,
                        pic: req.user.picture
=======
            spotify('new_user', {username: req.query.username}, () => {
                //spotify('refresh', {username: req.query.ID, token: req.user.spotify.refresh_token}, () => {
                spotify('grabPlaylists', {username: req.query.username, access_token: req.query.access_token}, (playlists) => {
                    MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
                        if (err) return console.error(err);
                        const db = database.db("musicDEV");
                        let count = 0;

                        useCollection = db.collection("users");
                        useCollection.findOne({"id": req.query.username, "playlist": {$exist: true}, "activePlaylist": {$exist: true}}, function (err, resp) {
                            console.log(resp)
                            res.json({
                                name: req.query.username,
                                username: req.query.name,
                                pic: req.query.image,
                                new_user: (!resp || resp === null),
                                playlists: playlists
                            });
                        });
>>>>>>> d6c8f9d... New methods added
                    });
                });
                //});
            });
        },
        currentSong: function(req, res) {
            spotify("grabCurrentMusic", {username: req.query.username}, data => {
                res.json({
                    isPlaying: data.is_playing,
                    song: data.item.name,
                    artist: data.item.artists[0].name
                });
            });
        },
        grabPlaylistGenre: function(req, res) {
            console.log(req.query)

            MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
                if (err) return console.error(err);
                const db = database.db("musicDEV");

                useCollection = db.collection("users");
                useCollection.update({id: req.query.username}, { $set: { activePlaylists: req.query.playlists } }, { upsert: true } );

                trainer("grabURI", req.query.username, req.query.access_token, req.query.playlists, () => {
                    console.log("Job done")
                    res.json({
                        success: true
                    });
                });
            });
        }
    };
};
