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
            router.get('/grabActivePlaylist', this.grabActivePlaylist)
        },

        initialLoad: function(req, res) {
            spotify('new_user', {username: req.query.username}, () => {
                //spotify('refresh', {username: req.query.ID, token: req.user.spotify.refresh_token}, () => {
                spotify('grabPlaylists', {username: req.query.username, access_token: req.query.access_token}, (playlists) => {
                    if(playlists.success){
                        MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
                            if (err) return console.error(err);
                            const db = database.db("musicDEV");

                            useCollection = db.collection("users");
                            useCollection.findOne({id: req.query.username, activePlaylists: {$exists: true}, playlist: {$exists: true}}, function (err, resp) {
                                if(err) console.log("Mongo error: ", err);
                                res.json({
                                    name: req.query.username,
                                    username: req.query.name,
                                    pic: req.query.image,
                                    new_user: (!resp || resp === null),
                                    playlists: playlists.data,
                                    success: true
                                });
                            });
                        });
                    } else {
                        res.json({success: false});
                    }
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
        },
        grabActivePlaylist: function(req, res) {
            MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
                if (err) return console.error(err);
                const db = database.db("musicDEV");

                useCollection = db.collection("users");
                useCollection.findOne({id: req.query.username}, { activePlaylists: { $exists: true } }, (err, resp) => {
                    if (err) console.log(err);

                    if(resp !== null){
                        if(resp.activePlaylists !== null){
                            res.json({
                                success: true,
                                playlists: resp.activePlaylists
                            });
                        }
                    } else {
                        res.json({success: false});
                    }
                });
            });
        }
    };
};
