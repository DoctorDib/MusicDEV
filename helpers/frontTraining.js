const predict = require('./musicTool/helpers/predict');
const config = require('../config/config');
const spotify = require('./spotify_api');

const async = require('async');
const brain = require('brain.js');
const MongoClient = require('mongodb').MongoClient;

function chunk(array, size) {
    const arrayChunk = [];
    for (let i = 0; i < array.length; i++) {
        const last = arrayChunk[arrayChunk.length - 1];
        if (!last || last.length === size) {
            arrayChunk.push([array[i]]);
        } else {
            last.push(array[i]);
        }
    }
    return arrayChunk;
}

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
                    let net = new brain.NeuralNetwork(config.classification_config.predict);
                    net.fromJSON(respMemory);
                    predict(net, memoryValue.features, (resp) => {
                        memoryValue.genre = resp;
                        final.push(memoryValue);
                        if(count < Object.keys(inputData).length){
                            memoryCallback();
                        } else {
                            count=0;
                            genreCallback(final);
                        }
                    });
                });
            },
            sort: function (memory, trackInfo, callback) {
                let resp = {};
                async.eachOfSeries(memory, function (memoryValue, memoryKey, memoryCallback) {
                    resp[memoryValue.id] = {
                        id: memoryValue.id,
                        name: trackInfo[memoryValue.id],
                        features: {
                            danceability: memoryValue.features.danceability,
                            energy: memoryValue.features.energy,
                            key: memoryValue.features.key,
                            loudness: memoryValue.features.loudness,
                            speechiness: memoryValue.features.speechiness,
                            acousticness: memoryValue.features.acousticness,
                            instrumentalness: memoryValue.features.instrumentalness,
                            liveness: memoryValue.features.liveness,
                            valence: memoryValue.features.valence,
                            tempo: memoryValue.features.tempo,
                        }
                    };

                    if (memoryKey+1 >= memory.length) {
                        callback(resp);
                    } else {
                        memoryCallback();
                    }
                })
            },
            grabURI: function (username, playlists, callback) {
                let memory = [];
                let trackInfo = {};

                async.eachOfSeries(playlists, function (playlistValue, playlistKey, playlistCallback) {
                    let format = playlistValue.split(':');
                    format = format[format.length-1];

                    //grabTracks
                    spotify("grabTracksFromPlaylist", {username: username, access_token: accessToken, playlist: format}, (trackURIList) => {
                        let tmpTrackList = [];
                        async.eachOfSeries(trackURIList, function (trackValue, trackKey, trackCallback) {
                             tmpTrackList.push(trackValue.track.id);

                             if (trackKey+1 >= trackURIList.length){
                                 let choppedArray = chunk(tmpTrackList, 50)

                                 console.log(choppedArray.length)

                                 async.eachOfSeries(choppedArray, function (uriValues, uriKey, uriCallback) {
                                     spotify("grabTrackInfo", {username: username, access_token: accessToken, tracks: uriValues}, (respTrackInfo) => {

                                         let agg = respTrackInfo.body.tracks;
                                         for (let tmp = 0; tmp < agg.length; tmp++) {
                                             trackInfo[agg[tmp].id] = agg[tmp].name;
                                         }

                                         if(uriKey+1 >= choppedArray.length) {
                                             // finished
                                             spotify("grabFeaturesFromTracks", {username: username, access_token: accessToken, trackURIs: tmpTrackList}, (features) => {
                                                 memory = [...memory, ...features];
                                                 if (playlistKey+1 >= playlists.length){
                                                     run.sort(memory, trackInfo, (sortedObject) => {
                                                         run.grabGenreUserPlaylist(username, sortedObject, () => {
                                                             callback("finished")
                                                         });
                                                     });
                                                 } else {
                                                     playlistCallback();
                                                 }
                                             });
                                         } else {
                                             uriCallback();
                                         }
                                     });
                                 });
                             } else {
                                 trackCallback();
                             }
                        });
                    });
                });
            },
            grabGenreUserPlaylist: function (username, playlists, callback) {
                let useCollection = db.collection("musicMemory");
                let saveCollection = db.collection("users");

                useCollection.findOne({"id": 'memory'}, function (err, resp) {
                    if (!resp || resp === null) {
                        console.log("Memory not found... Please teach me...");
                        process.exit(1);
                    } else {
                        console.log("Found");
                        run.grabGenre(resp.memory, playlists, (finalResp) => {
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