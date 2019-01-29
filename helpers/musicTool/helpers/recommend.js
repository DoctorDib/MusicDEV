const MongoClient = require('mongodb').MongoClient;
const spotify = require('./spotifyApi');
const genreMapping = require('../config/recommendConfig');
const mongo = require('../../mongo');
const neo = require('./neo4j');

const async = require('async');

const spotifyHelper = require('../../spotify_api');

function addSongs (username, playlistOptions, music, callback) {
    spotifyHelper('saveToPlaylist', {username: username, playlistOptions: playlistOptions, music: music}, (resp) => {
        callback()
    });
}

function saveRecommendedMusic (username, music, callback) {
    mongo('grabOne', 'users', {identifier: {id: username}}, (data) => {
        // Checking if there is already a musicDEV playlist
        if (JSON.parse(data.records.playlistOptions.is_active)) {
            // Add songs
            addSongs(username, data.records.playlistOptions, music, () => {
                callback();
            });
        } else {
            // Create playlist
            spotifyHelper('createPlaylist', {username: username, playlistOptions: data.records.playlistOptions}, (resp) => {
                if (JSON.parse(resp.success)) {
                    let newPlaylistOptions = data.records.playlistOptions;
                    newPlaylistOptions.is_active = true;
                    newPlaylistOptions.id = resp.data.body.id;

                    mongo('update', 'users', {identifier: {id: username}, data: {playlistOptions: newPlaylistOptions}});
                    console.log("Saved new playlist")
                    addSongs(username, newPlaylistOptions, music, () => {
                        callback();
                    });
                }
            });
        }
    });
}

module.exports = function (spotifyApi, data, callback) {
    MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
        const db = database.db("musicDEV");
        if (err) return callback({success: false, error: err});

        let userCollection = db.collection("users");
        let finalReturn = [], errorReturn = [];

        console.log("Start")

        async.eachOfSeries(data.genres, function (genre, genreKey, genreCallback) {
            let genreCollection = genreMapping.activities[genre];
            console.log("Searcing for: " + genreCollection);

            let indexSelections = {};

            userCollection.aggregate(
                [
                    { '$match': {"id": data.username} },
                    { '$unwind': '$playlist'},
                    { '$match': {'playlist.genre': { $in: genreCollection }}}
                ]
            ).toArray(function(err, docs) {
                if (err) console.log(docs)

                let userPlaylist = [], userFeatureList = [], warningFlag=false;
                for (let index in docs) {
                    if (docs.hasOwnProperty(index)) {
                        userPlaylist.push(docs[index].playlist);
                        userFeatureList.push(docs[index].playlist.features);
                    }
                }

                let ewwArray = [];
                for (let eww=0; eww<data.musicQuantity; eww++){
                    ewwArray.push(eww);
                }

                async.eachOfSeries(ewwArray, function (quantity, quantityKey, quantityCallback) {
                    let random = Math.floor(Math.random() * userPlaylist.length);
                    if (indexSelections[random]){
                        // Song has already been selected
                        if (Object.keys(indexSelections).length >= userPlaylist.length) {
                            if (quantityKey+1 >= ewwArray.length){
                                if (genreKey+1 >= data.genres.length ) {
                                    // Finished
                                    if (JSON.parse(data.savePlaylist) && finalReturn.length) {
                                        saveRecommendedMusic(data.username, finalReturn, function (resp) {
                                            callback({success: !warningFlag, savePlaylist: data.savePlaylist, successData: finalReturn, failedSongs: errorReturn});
                                        });
                                    } else {
                                        callback({success: !warningFlag, savePlaylist: data.savePlaylist, successData: finalReturn, failedSongs: errorReturn});
                                    }
                                } else {
                                    genreCallback()
                                }
                            } else {
                                quantityCallback();
                            }
                        }
                    } else {
                        indexSelections[random] = true;
                        let selectedSong =  userPlaylist[random];

                        try {
                            console.log(userPlaylist[random])
                            console.log("Started learning from:")

                            console.log(selectedSong);

                            neo('exists', {genre: userPlaylist[random].genre, id: selectedSong.id}, (resp) => {
                                if (resp.success) {
                                    neo('recommend', {genre: userPlaylist[random].genre, song: selectedSong}, (resp) => {
                                        finalReturn.push(resp.data[0].returnedNode.properties);
                                        if (quantityKey+1 >= ewwArray.length){
                                            if (genreKey+1 >= data.genres.length ) {
                                                // Finished
                                                if (JSON.parse(data.savePlaylist) && finalReturn.length) {
                                                    saveRecommendedMusic(data.username, finalReturn, function (resp) {
                                                        callback({success: !warningFlag, savePlaylist: data.savePlaylist, successData: finalReturn, failedSongs: errorReturn});
                                                    });
                                                } else {
                                                    callback({success: !warningFlag, savePlaylist: data.savePlaylist, successData: finalReturn, failedSongs: errorReturn});
                                                }
                                            } else {
                                                genreCallback()
                                            }
                                        } else {
                                            quantityCallback();
                                        }
                                    });
                                } else {
                                    warningFlag = true; // There is at least one error existing
                                    console.log("HERE")
                                    selectedSong.success = false;
                                    errorReturn.push(selectedSong);
                                    if (quantityKey+1 >= ewwArray.length){
                                        if (genreKey+1 >= data.genres.length ) {
                                            // Finished
                                            callback({success: !warningFlag, successData: finalReturn, failedSongs: errorReturn})
                                        } else {
                                            genreCallback()
                                        }
                                    } else {
                                        quantityCallback();
                                    }
                                }
                            });
                        } catch(e) {
                            callback({success: false})
                        }
                    }
                });
            });
        });
    });
    //});
};
