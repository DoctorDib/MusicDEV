const async = require('async');
const config = require('../../../config/config');
const featureManager = require('../helpers/trackFeatureManager');


function grabSizingOfGenres (data) {
    let tmp = {};
    for (let genre in config.active_genres) {
        if (config.active_genres.hasOwnProperty(genre) && config.active_genres[genre]) {
            if (!tmp.hasOwnProperty(genre)) tmp[genre] = {};
            tmp[genre] = {
                total: data.musicCats[genre].length,
                percentage: Math.ceil(data.musicCats[genre].length * (config.classification_config.general.cutTrainingPercentage / 100))
            };
        }
    }
    return tmp;
}

function getHighLow (value) {
    return {
        high: (value * config.classification_config.general.gapAllowance),
        low: (value / config.classification_config.general.gapAllowance)
    };
}

function grabHighLow (data, callback) {
    let avgObject = {}, genreFeatureCount = {}, index=0;

    async.eachOfSeries(data.musicCats, (genre, genreKey, genreCallback) => {
        index ++;

        async.eachOfSeries(genre, (track, trackKey, trackCallback) => {

            if (!genreFeatureCount.hasOwnProperty(genreKey)) genreFeatureCount[genreKey] = {};
            if (!genreFeatureCount[genreKey].hasOwnProperty("count")) genreFeatureCount[genreKey].count = 0;

            featureManager(track.input, false, trackFeatures => {

                for (let feature in trackFeatures) {
                    if (trackFeatures.hasOwnProperty(feature)) {
                        if (!genreFeatureCount[genreKey].hasOwnProperty(feature)) genreFeatureCount[genreKey][feature] = 0;

                        genreFeatureCount[genreKey][feature] = genreFeatureCount[genreKey][feature] += trackFeatures[feature];
                        genreFeatureCount[genreKey].count++;
                    }
                }

                if (trackKey+1 >= genre.length) {

                    // Working out the range
                    if (!avgObject.hasOwnProperty(genre)) avgObject[genreKey] = {};
                    for (let feature in trackFeatures) {
                        if (trackFeatures.hasOwnProperty(feature)) {
                            if (!avgObject[genreKey].hasOwnProperty(feature)) avgObject[genreKey][feature] = {};
                            avgObject[genreKey][feature] = getHighLow(genreFeatureCount[genreKey][feature] / genreFeatureCount[genreKey].count)
                        }
                    }

                    if (index >= Object.keys(data.musicCats).length) {
                        console.log("Grabbing high and low has finished.");
                        callback(avgObject);
                    } else {
                        genreCallback();
                    }
                } else {
                    trackCallback();
                }
            });
        });
    });
}

function grabSuitableTrainingData (data, counter, limit, callback) {
    let suitableData={}, activeGenres={}, index=0;

    async.eachOfSeries(data.musicCats, (genre, genreKey, genreCallback) => {
        index ++;

        async.eachOfSeries(genre, (track, trackKey, trackCallback) => {
            let add=true, strikes=0;

            featureManager(track.input, false, trackFeatures => {
                // Looping through active features of track
                for (let feature in trackFeatures) {
                    if (trackFeatures.hasOwnProperty(feature)) {
                        // Ensuring that the feature is within the genre feature boundary limit.
                        if (trackFeatures[feature] > limit[genreKey][feature].high || trackFeatures[feature] < limit[genreKey][feature].low) {
                            add = false;
                            strikes ++;
                        }
                    }
                }

                if (add || strikes <= config.classification_config.general.maxStrikes) {
                    if (!activeGenres.hasOwnProperty(genreKey)) activeGenres[genreKey] = true;

                    // Setting up array
                    if (!suitableData.hasOwnProperty(genreKey)) suitableData[genreKey] = [];
                    // Pushing data into array
                    suitableData[genreKey].push(track);
                }

                if (trackKey+1 >= genre.length) {
                    if (index >= Object.keys(data.musicCats).length) {
                        console.log("Grabbed suitable training data.");

                        if (Object.keys(suitableData).length) {
                            callback(suitableData);
                        } else {
                            console.log("No data can be grabbed... please change around the config file.")
                        }
                    } else {
                        genreCallback();
                    }
                } else {
                    trackCallback();
                }
            });
        });
    });
}

function grabPercentageOfTracks (data, totalLimit, callback) {
    let final = [];

    if (!config.classification_config.general.grabMin) {
        // Make sure that the current tracks length if not higher than original percentage

        for (let genre in data) {
            if (data.hasOwnProperty(genre)) {
                let limit = data[genre].length;
                if (data[genre].length > totalLimit[genre].percentage) {
                    limit = totalLimit[genre].percentage;
                }

                final = [...final, ...data[genre].splice(0, limit)];
            }
        }

        console.log("Grabbed percentage of training samples - PART 1");
        callback(final);
    } else {
        let min = false;
        // Looping through sorted data to find min number
        for (let genre in data) {
            if (data.hasOwnProperty(genre)) {
                if (!min) min = data[genre].length;
                if (data[genre].length < min) min = data[genre].length
            }
        }

        console.log(min)

        // Looping through grabbing final data
        for (let genre in data) {
            if (data.hasOwnProperty(genre)) {
                final = [...final, ...data[genre].splice(0, min)];
            }
        }

        console.log("Grabbed percentage of training samples - PART 2");
        callback(final);
    }
}

function grabTrackIDTrainingSample (data, callback) {
    let activeList={};

    async.eachOfSeries(data, (track, trackKey, trackCallback) => {
        activeList[track.input.id] = true;

        if (trackKey + 1 >= data.length) {
            console.log("Finished collecting ID's")
            callback(activeList);
        } else {
            trackCallback();
        }
    });
}

// This function grabs the remaining data that did not make it to the training sample
function grabTestingSample (data, activeIDs, callback) {
    let final=[], index=0;

    async.eachOfSeries(data.musicCats, (genre, genreKey, genreCallback) => {
        index ++;

        async.eachOfSeries(genre, (track, trackKey, trackCallback) => {

            if (!activeIDs.hasOwnProperty(track.input.id)) final.push(track);

            if (trackKey+1 >= genre.length) {
                if (index >= Object.keys(data.musicCats).length) {
                    callback(final);
                } else {
                    genreCallback();
                }
            } else {
                trackCallback();
            }
        });
    });
}

// TODO - Possibly keep raw data for future referencing
function processData (data, counter, callback) {
    let final=[];
    async.eachOfSeries(data, (track, trackKey, trackCallback) => {
        featureManager(track.input, true, newTrackFeatures => {
            track.input = newTrackFeatures;
            final.push(track);

            if (trackKey+1 >= data.length) {
                callback(final);
            } else {
                trackCallback();
            }
        }, counter);
    });
}

function grabActiveGenreMusic (data, callback) {

    let activeMusic = { musicCats: {}, counter: data.counter };

    for (let genre in config.active_genres) {
        // If exists and value is true...
        if (config.active_genres.hasOwnProperty(genre) && config.active_genres[genre]) {
            activeMusic.musicCats[genre] = data.musicCats[genre];
        }
    }

    callback(activeMusic);
}

module.exports = (data, callback) => {

    // STAGE 1: Grabbing total sizing of tracks per genre
    let totalGenreTracks = grabSizingOfGenres(data);

    // NEW STAGE TODO - GRAB LIST OF AVAILABLE GENRE MUSIC IN ARRAY FORMAT
    grabActiveGenreMusic(data, musicData => {

        // STAGE 2: Grabbing compatible genre range
        grabHighLow(musicData, genreRangeLimit => {

            // STAGE 3: Collecting the suitable data for training
            grabSuitableTrainingData(musicData, data.counter, genreRangeLimit, suitableData => {

                // STAGE 4: Grabbing X% of tracks per genre
                grabPercentageOfTracks(suitableData, totalGenreTracks, trainingSample => {

                    // STAGE 5: Grab active tracks from training sample (to work out the remaining tracks)
                    grabTrackIDTrainingSample(trainingSample, activeList => {

                        // STAGE 6: Grab the remaining genre tracks into a testing sample
                        grabTestingSample(musicData, activeList, testingSample => {

                            // STAGE 7: Prepare samples
                            processData(trainingSample, data.counter, newTrainingSample => {
                                processData(testingSample, data.counter, newTestingSample => {
                                    console.log(genreRangeLimit)
                                    callback({testingSample: newTestingSample, trainingSample: newTrainingSample})
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};