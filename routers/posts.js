const spotify = require('../helpers/spotify_api.js');
const mongoose = require('../helpers/mongoose');
const MongoClient = require('mongodb').MongoClient;
const async = require('async');

const trainer = require('../helpers/frontTraining');
const recommender = require('../helpers/musicTool/helpers/recommend');

module.exports = function () {
    return {
        setRouting: function (router) {
            router.get('/currentSong', this.currentSong);
            router.get('/grabPlaylistGenre', this.grabPlaylistGenre);
            router.get('/grabActivePlaylist', this.grabActivePlaylist);
            router.get('/recommend', this.recommendingMusic);
            router.get('/initial', this.initial);
            router.get('/refreshToken', this.refreshToken);
        },

        recommendingMusic: function(req, res) {
            let tmpGenres=[];
            let states = JSON.parse(req.query.genreStates)

            // Grabs a list of active genres selected by the user.
            for (let index in states) {
                if (states.hasOwnProperty(index)){
                    if (states[index]) {
                        tmpGenres.push(index);
                    }
                }
            }

            spotify('grabToken', {username: req.query.username}, token => {
                console.log(tmpGenres)
                console.log(tmpGenres.length)

                recommender(token, {genres: tmpGenres, username: req.query.username, musicQuantity: req.query.musicQuantity}, resp => {
                    console.log("Response: ", resp);
                    res.json(resp);
                });
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
            MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
                if (err) return console.error(err);
                const db = database.db("musicDEV");
                useCollection = db.collection("users");
                useCollection.update({id: req.query.username}, { $set: { activePlaylists: req.query.playlists } }, { upsert: true } );
                useCollection.findOne({id: req.query.username}, (err, resp) => {
                    if(err)return console.log(err);
                    trainer("grabURI", req.user.id, resp.spotify.access_token, req.query.playlists, () => {
                        console.log("Job done")
                        res.json({
                            success: true
                        });
                    });
                });
            });
        },
        grabActivePlaylist: function(req, res) {
            MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
                if (err) return console.error(err);
                const db = database.db("musicDEV");
                useCollection = db.collection("users");
                useCollection.findOne({id: req.user.id}, { activePlaylists: { $exists: true } }, (err, resp) => {
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
        },
        initial: function (req, res) {
            console.log(req.user.id)

            spotify('new_user', {username: req.user.id}, () => {

                MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
                    if (err) return console.error(err);
                    const db = database.db("musicDEV");

                    useCollection = db.collection("users");
                    useCollection.findOne({id: req.user.id}, function(err, resp){
                        if (err) return console.log(err)

                        spotify('grabPlaylists', {
                            username: req.user.id,
                            access_token: resp.spotify.access_token
                        }, (playlists) => {
                            if (playlists.success) {
                                res.json({
                                    new_user: !resp.activePlaylist.length,
                                    userAccount: req.user,
                                    playlists: playlists.data,
                                    success: true,
                                    access_token: resp.spotify.access_token
                                });
                            } else {
                                res.json({success: false});
                            }
                        });
                    })
                })
            });
        },
        refreshToken: function (req, res) {
            MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
                if (err) return console.error(err);
                const db = database.db("musicDEV");

                useCollection = db.collection("users");
                useCollection.findOne({username: req.user.id}, function(err, resp){
                    if (err) return console.log(err)

                    spotify('refresh', {username: req.user.id, token: resp.spotify.refresh_token}, (data) => {
                        useCollection.update({username: req.user.id}, {'spotify': {access_token: data.access_token, refresh_token: data.refresh_token}});
                        res.redirect('/');
                    });
                })
            })
        }
    };
};
