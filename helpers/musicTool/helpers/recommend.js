const MongoClient = require('mongodb').MongoClient;
const spotify = require('./spotifyApi');
const genreMapping = require('../config/recommendConfig');

const async = require('async');

module.exports = function (spotifyApi, data, callback) {
    MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
        const db = database.db("musicDEV");
        if (err) return callback({success: false, error: err});

        let useCollection = db.collection("masterMusic");
        let userCollection = db.collection("users");
        let finalReturn = [];

        async.eachOfSeries(data.genres, function (genre, genreKey, genreCallback) {
            let genreCollection = genreMapping.activities[genre];

            useCollection.aggregate(
                [
                    { '$match': {"id": "master"} },
                    { '$unwind': '$master'},
                    { '$match': {'master.genre': { $in: genreCollection }}}
                ]
            ).toArray(function(err, docs) {
                if(err) console.log(err);

                let databaseData = [], featureData = [];
                for (let index in docs) {
                    if (docs.hasOwnProperty(index)) {
                        databaseData.push(docs[index].master);
                        featureData.push(docs[index].master.features);
                    }
                }

                userCollection.aggregate(
                    [
                        { '$match': {"id": data.username} },
                        { '$unwind': '$playlist'},
                        { '$match': {'playlist.genre': { $in: genreCollection }}}
                    ]
                ).toArray(function(err, docs) {
                    if (err) console.log(docs)

                    let userPlaylist = [], userFeatureList = [];
                    for (let index in docs) {
                        if (docs.hasOwnProperty(index)) {
                            userPlaylist.push(docs[index].playlist);
                            userFeatureList.push(docs[index].playlist.features);
                        }
                    }

                    console.log(typeof data.musicQuantity)
                    let ewwArray = [];
                    for (let eww=0; eww<data.musicQuantity; eww++){
                        ewwArray.push(eww);
                    }

                    console.log(ewwArray)

                    //while (tmpIndex < data.musicQuantity) {
                    async.eachOfSeries(ewwArray, function (quantity, quantityKey, quantityCallback) {
                        console.log("hi")
                        let config = {objects: featureData, number: 1};
                        let nearestNeighbour = require('nearestneighbour')(config)
                        console.log("pi")
                        let random = Math.floor(Math.random() * userPlaylist.length);
                        console.log("hi")
                        let uri = userPlaylist[random].id.split(':')
                        uri = uri[uri.length - 1];

                        console.log(uri);

                        try {
                            spotify.grabSingleFeature(spotifyApi, uri, function (respData) {

                                console.log("hier")
                                let resultList = nearestNeighbour.nearest(respData)[0]
                                console.log(resultList)

                                console.log("Started")
                                for (let i in databaseData) {
                                    if (Object.is(databaseData[i].features, resultList)) {
                                        console.log("I recommend:");
                                        console.log(databaseData[i]);
                                        databaseData[i].activity = genre;
                                        finalReturn.push(databaseData[i]);

                                        if (quantityKey+1 >= ewwArray.length){
                                            if (genreKey+1 >= data.genres.length ) {
                                                // Finished
                                                callback({success: true, data: finalReturn})
                                            } else {
                                                genreCallback()
                                            }
                                        } else {
                                            quantityCallback();
                                        }
                                        break;
                                    }
                                }
                            });
                        } catch(e) {
                            callback({success: false})
                        }
                    });

                    // }
                });
            });
        });
    });
};