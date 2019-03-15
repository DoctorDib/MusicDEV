const fs = require('fs');
const async = require('async');
const slugify = require('slugify');

const neo4j = require('../helpers/neo4j');
const config = require('../../../config/config');
const spotify = require('../helpers/spotifyApi');
const push = require('../helpers/pushbullet');
const grabGenre = require('./grabGenre');

function readTextFile(fileText, callback) {
    fs.readFile(fileText, 'utf8', (err, data) => {
        if (err) return console.log(err);
        callback(JSON.parse(data).playlists);
    });
}

module.exports = function (spotifyApi, arrayLength, dataTracks) {
    let finalObject = {}, finalArray = [];

    async.eachOfSeries(arrayLength, (value, keyFiles, callbackFiles) => {
        function finishLoop () {
            if (keyFiles + 1 >= arrayLength.length) {
                async.eachOfSeries(config.recommendation_config.genres, (genre, genreKey, genreCallback) => {
                    neo4j('masterLearn', { genre: genre }, () => {
                        if (genreKey + 1 >= config.recommendation_config.genres.length) {
                            let body = `Database build has been completed with ${finalArray.length} entries.`;
                            push.send({
                                title: "Database build complete",
                                body: body
                            });
                        } else {
                            genreCallback();
                        }
                    });
                });
            } else {
                /*let body = `${value+1}/${arrayLength.length} complete`; // TODO - COMMENTED OUT BECAUSE OF API 500 MONTHLY LIMIT
                push.send({
                    title: "Partial",
                    body: body
                });*/
                callbackFiles();
            }
        }

        //mpd.slice.1000-1999.json
        //"../Data/trackData/mpd.slice." + value + ".json"
        readTextFile(`../Data/trackData/mpd.slice.${value+1}000-${value+1}999.json`, json => {
            async.eachOfSeries(json, (jsonValue, jsonKey, jsonCallback) => {
                let uriArray = [];
                async.eachOfSeries(jsonValue.tracks, (trackValue, trackKey, trackCallback) => {
                    let uri = trackValue.track_uri.split(':');

                    let count = trackValue.pos;
                    if (trackValue.hasOwnProperty("track_uri")) {
                        uri = uri[uri.length - 1];
                        if (finalObject.hasOwnProperty(uri)) {
                            console.log("DUPLICATED")
                            if (jsonKey + 1 >= Object.keys(json).length) {
                                finishLoop();
                            } else {
                                jsonCallback();
                            }
                        } else {
                            uriArray.push(uri); // Adding uri to array
                            finalObject[uri] = { name: trackValue.track_name, id: uri }; // Creating empty object for duplicated data detection

                            if (trackKey + 1 >= Object.keys(jsonValue.tracks).length) {
                                uriArray = uriArray.chunk(50);
                                async.eachOfSeries(uriArray, (uriArrayValue, uriArrayKey, uriArrayCallback) => {
                                    setTimeout(() => {
                                        spotify.grabFeatures(spotifyApi, false, uriArrayValue, data => {
                                            async.eachOfSeries(data, (featuresValue, featuresKey, featuresCallback) => {
                                                let ident = featuresValue.id;
                                                delete featuresValue.id; // Sorting out data

                                                // Grabbing the predicted Genre
                                                grabGenre(dataTracks.memory, featuresValue, genre => {
                                                    finalObject[ident].features = featuresValue;
                                                    finalObject[ident].genre = genre;
                                                    finalArray.push(finalObject[ident]);

                                                    let tmpObj = finalObject[ident];

                                                    neo4j('create', {
                                                        count: count,
                                                        params: tmpObj,
                                                        single: false
                                                    }, resp => {
                                                        if (!resp.success) console.log("Create Error: ", resp.error);
                                                        // else continue with life

                                                        let finalResponse = `==================================================\nID: ${count}\nName: ${finalObject[ident].name}\nGenre: ${genre}`;
                                                        console.log(finalResponse)

                                                        if (featuresKey + 1 >= data.length) {
                                                            if (uriArrayKey + 1 >= uriArray.length) {
                                                                if (jsonKey + 1 >= Object.keys(json).length) {
                                                                    finishLoop();
                                                                } else {
                                                                    jsonCallback();
                                                                }
                                                            } else {
                                                                uriArrayCallback();
                                                            }
                                                        } else {
                                                            featuresCallback();
                                                        }
                                                    });
                                                });
                                            });
                                        });
                                    }, 100);
                                });
                            } else {
                                trackCallback();
                            }
                        }
                    }
                });
            });
        });
    });
};