const async = require('async');
const config = require('../../../config/config');

const featureManager = require('./trackFeatureManager');

let activeGenres = {};

function getHighLow (value) {
    return {
        high: (value * config.classification_config.general.gapAllowance),
        low: (value / config.classification_config.general.gapAllowance)
    };
}

function grabHighLow (data, callback) {
    let avgObject = {}, genreFeatureCount = {};

    async.eachOfSeries(data, (track, trackKey, trackCallback) => {
        let currentGenre = Object.keys(track.output)[0];

        if (!genreFeatureCount.hasOwnProperty(currentGenre)) genreFeatureCount[currentGenre] = {};
        if (!genreFeatureCount[currentGenre].hasOwnProperty("count")) genreFeatureCount[currentGenre].count = 0;

        let trackFeatures = featureManager(track.input);

        for (let feature in trackFeatures) {
            if (trackFeatures.hasOwnProperty(feature)) {
                if (!genreFeatureCount[currentGenre].hasOwnProperty(feature)) genreFeatureCount[currentGenre][feature] = 0;

                genreFeatureCount[currentGenre][feature] = genreFeatureCount[currentGenre][feature] += trackFeatures[feature];
                genreFeatureCount[currentGenre].count++;
            }
        }

        if (trackKey +1 >= data.length) {

            for (let genre in genreFeatureCount) {
                if (genreFeatureCount.hasOwnProperty(genre)) {

                    if (!avgObject.hasOwnProperty(genre)) avgObject[genre] = {};

                    for (let feature in trackFeatures) {
                        if (trackFeatures.hasOwnProperty(feature)) {
                            if (!avgObject[genre].hasOwnProperty(feature)) avgObject[genre][feature] = {};
                            avgObject[genre][feature] = getHighLow(genreFeatureCount[currentGenre][feature] / genreFeatureCount[currentGenre].count)
                        }
                    }
                }
            }

            callback(avgObject);
        } else {
            trackCallback();
        }
    });
}

function normalise (data, avgObject, callback) {
    let final = [];

    async.eachOfSeries(data, (track, trackKey, trackCallback) => {
        let currentGenre = Object.keys(track.output)[0], add = true, strikes=0;

        let trackFeatures = featureManager(track.input, false);
        // Looping through active features of track
        for (let feature in trackFeatures) {
            if (trackFeatures.hasOwnProperty(feature)) {
                // Ensuring that the feature is within the genre feature boundary limit.
                if (track.input[feature] > avgObject[currentGenre][feature].high || track.input[feature] < avgObject[currentGenre][feature].low) {
                    add = false;
                    strikes ++;
                }
            }
        }

        if (add || strikes < config.classification_config.general.maxStrikes) {
            activeGenres[currentGenre] = true;
            final.push(track);
        }

        if (trackKey +1 >= data.length) {
            console.log(`Active genres: ${Object.keys(activeGenres).length}`)
            console.log(activeGenres)
            console.log("==========");
            if (Object.keys(activeGenres).length < config.recommendation_config.genres.length) {
                console.log("FAILED: please raise the gap allowance or max strikes in the config file.");
                process.exit(1);
            } else {
                console.log("Success");
                callback(final);
            }
        } else {
            trackCallback();
        }
    });
}

module.exports = (data, callback) => grabHighLow(data, avgObject => normalise(data, avgObject, finishedDataSet => callback(finishedDataSet)));