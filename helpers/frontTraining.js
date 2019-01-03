const predict = require('./musicTool/helpers/predict');
const config = require('./musicTool/config/config');

const spotify = require('./spotify_api');

const SpotifyWebApi = require('spotify-web-api-node');
const async = require('async');
const brain = require('brain.js');
const MongoClient = require('mongodb').MongoClient;

module.exports = (func, username, accessToken, playlists, callback) => {

    MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
        if (err) return console.error(err);
        const db = database.db("musicDEV");
        let count = 0;

        const run = {
            grabGenre: function (respMemory, inputData, genreCallback) {
                let final=[];

                async.eachOfSeries(inputData, function (memoryValue, memoryKey, memoryCallback) {
                    count++;

                    let net = new brain.NeuralNetwork(config.predict);
                    net.fromJSON(respMemory);

                    predict(net, memoryValue.features, (resp) => {
                        memoryValue.genre = resp;

                        console.log(memoryValue)
                        final.push(memoryValue);

                        if(count < Object.keys(inputData).length){
                            console.log(count)
                            console.log("nexty")
                            console.log(Object.keys(inputData).length)
                            memoryCallback();
                        } else {
                            count=0;
                            console.log("fin")
                            genreCallback(final);

                        }
                    });
                });
            },
            sort: function (memory, callback) {
                let resp = {};
                async.eachOfSeries(memory, function (memoryValue, memoryKey, memoryCallback) {
                    resp[memoryValue.id] = {
                        id: memoryValue.id,
                        features: {
                            danceability: memoryValue.danceability,
                            energy: memoryValue.energy,
                            key: memoryValue.key,
                            loudness: memoryValue.loudness,
                            speechiness: memoryValue.speechiness,
                            acousticness: memoryValue.acousticness,
                            instrumentalness: memoryValue.instrumentalness,
                            liveness: memoryValue.liveness,
                            valence: memoryValue.valence,
                            tempo: memoryValue.tempo,
                        }
                    }

                    if (memoryKey+1 >= memory.length) {
                        callback(resp);
                    } else {
                        memoryCallback();
                    }
                })
            },
            grabURI: function (username, playlists, callback) {
                let memory = [];

                async.eachOfSeries(playlists, function (playlistValue, playlistKey, playlistCallback) {
                    let format = playlistValue.split(':')
                    format = format[format.length-1];

                    console.log("1. " + format )

                    //grabTracks
                    spotify("grabTracksFromPlaylist", {username: username, access_token: accessToken, playlist: format}, (trackURIList) => {
                        let tmpTrackList = [];
                        async.eachOfSeries(trackURIList, function (trackValue, trackKey, trackCallback) {
                             tmpTrackList.push(trackValue.track.id);

                             if (trackKey+1 >= trackURIList.length){
                                 spotify("grabFeaturesFromTracks", {username: username, access_token: accessToken, trackURIs: tmpTrackList}, (features) => {
                                     memory = [...memory, ...features];

                                     if (playlistKey+1 >= playlists.length){
                                         run.sort(memory, (sortedObject) => {
                                             run.grabGenreUserPlaylist(username, sortedObject, () => {
                                                 callback("finished")
                                             });
                                         });
                                     } else {
                                         playlistCallback();
                                     }
                                 });
                             } else {
                                 trackCallback();
                             }
                        });
                    });
                });
            },
            grabGenreUserPlaylist: function (username, playlists, callback) {
                useCollection = db.collection("musicMemory");
                saveCollection = db.collection("users");

                useCollection.findOne({"id": 'memory'}, function (err, resp) {
                    if (!resp || resp === null) {
                        console.log("Memory not found... Please teach me...");
                        process.exit(1);
                    } else {
                        console.log("Found");
                        run.grabGenre(resp.memory, playlists, (finalResp) => {

                            console.log("Hi")
                            console.log(finalResp)

                            saveCollection.update({id: username}, {$set: {"playlist": finalResp} }, {upsert: true});
                            callback(finalResp);
                        });
                    }
                });
            },
        }

        run[func](username, playlists, () => {
            callback({response: "Success"});
        });
    });
}