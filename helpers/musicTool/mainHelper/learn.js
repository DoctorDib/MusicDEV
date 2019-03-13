const fs = require('fs');
const async = require('async');

const dictionary =  require('../../Data/genreDictionary');
const spotify = require('../helpers/spotifyApi');

module.exports = function (spotifyApi, limit, callback) {
    let savedUriTracks = {};
    let savedTracks = {};
    let memory = {};
    let type;

    function finished(memory, savedTracks, finishedCallback) {
        let dupes = {};
        for (let uri in savedTracks) {
            if (savedTracks.hasOwnProperty(uri)) {
                if (Object.keys(savedTracks[uri]).length > 1) {

                    let high = 0;
                    let selectedType = '';

                    for (let type in savedTracks[uri]) {
                        if(savedTracks[uri].hasOwnProperty(type) && type !== "track"){
                            if(savedTracks[uri][type] > high) {
                                high = savedTracks[uri][type];
                                selectedType = type;
                            }
                        }
                    }

                    savedTracks[uri].track.features.output = { [selectedType] : 1 };
                    memory[selectedType].push( savedTracks[uri].track.features);
                    dupes[uri] = savedTracks[uri];
                }
            }
        }
        console.log("Writing to file");
        fs.writeFile("../musicTool/tests/dupes.json", JSON.stringify(dupes), (err) => {
            if (err) return console.error(err);
            console.log("File has been created");
            finishedCallback(memory);
        });
    }

    function final (memory, savedTracks) {
        let featureCount = {};

        // Looping through grabbing min and max for each feature

        for (let genre in memory) {
            if (memory.hasOwnProperty(genre)) {
                for (let track in memory[genre]) {
                    if (memory[genre].hasOwnProperty(track)) {
                        for (let feature in memory[genre][track].input) {
                            if (memory[genre][track].input.hasOwnProperty(feature)) {
                                let val = memory[genre][track].input[feature];

                                if (!featureCount.hasOwnProperty(feature)){
                                    featureCount[feature] = {min : val, max: val, count: 1};
                                } else {
                                    if (val > featureCount[feature].max) featureCount[feature].max = val;
                                    if (val < featureCount[feature].min) featureCount[feature].min = val;
                                    featureCount[feature].count ++;
                                }
                            }
                        }
                    }
                }
            }
        }

        console.log(featureCount);

        finished(memory, savedTracks, newMemory => {
            callback(featureCount, newMemory)
        });
    }

    async.eachOfSeries(dictionary, (dictionaryValue, mainKey, dictionaryCallback) => {
        if (dictionaryValue.hasOwnProperty("category") && dictionaryValue.hasOwnProperty("uriList")) {
            type = dictionaryValue.category;

            async.eachOfSeries(dictionaryValue.uriList, (uriValue, uriKey, uriCallback) => {
                spotify.grabPlaylists(spotifyApi, type, uriValue, (data) => {

                    let tracks = [];
                    async.eachOfSeries(data, (track, trackKey, trackCallback) => {
                        if (savedUriTracks.hasOwnProperty(track.id)) {
                            console.log("Already existing track");
                            // Wanting to save both so I can compare the genres that the data has
                            if(!savedTracks.hasOwnProperty(track.id)) {
                                savedTracks[track.id] = {
                                    track: track
                                };
                            }

                            if (!savedTracks[track.id].hasOwnProperty(type)) savedTracks[track.id][type] = 0;

                            savedTracks[track.id][type] = savedTracks[track.id][type] += 1; // Recording how many times it has popped up
                            console.log(savedTracks[track.id][type])
                        } else {
                            savedUriTracks[track.id] = track;
                            tracks.push(track.features);
                        }

                        if (trackKey+1 >= data.length) {
                            if (!memory[type]) memory[type] = [];
                            memory[type] = [...memory[type], ...tracks];
                            if (limit) memory[type] = memory[type].splice(0, limit);
                            if (uriKey + 1 >= dictionaryValue.uriList.length) {
                                if ((mainKey + 1) !== dictionary.length) {
                                    dictionaryCallback();
                                } else {
                                    final(memory, savedTracks);
                                }
                            } else {
                                console.log("==========================================================================");
                                console.log(type + ' - ' + (uriKey + 1) + '/' + dictionaryValue.uriList.length);
                                console.log("TOTAL: " + ' - ' + (mainKey + 1) + '/' + dictionary.length);
                                console.log("==========================================================================");
                                if (limit && memory[type].length >= limit) {
                                    if (mainKey + 1 === dictionary.length) {
                                        final(memory, savedTracks);
                                    } else {
                                        dictionaryCallback();
                                    }
                                } else {
                                    uriCallback();
                                }
                            }
                        } else {
                            trackCallback();
                        }
                    });
                });
            });
        }
    });
};