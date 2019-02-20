const async = require('async');
const config = require('../../../config/config');

let gap = 0.5;

function getHighLow (value) {
    return {high: value + gap, low: value - gap};
}

function grabHighLow (data, callback) {
    let avgObject = {}, index = 0;

    async.eachOfSeries(data.musicCats, (genreValue, genreKey, genreCallback) => {
        index ++;

        let danceability = 0;
        let energy = 0;
        let key = 0;
        let loudness = 0;
        let mode = 0;
        let speechiness = 0;
        let instrumentalness = 0;
        let valence = 0;
        let tempo = 0;

        async.eachOfSeries(genreValue, (track, trackKey, trackCallback) => {
            danceability = danceability += track.input.danceability;
            energy = energy += track.input.energy;
            key = key += track.input.key;
            loudness = loudness += track.input.loudness;
            mode = mode += track.input.mode;
            speechiness = speechiness += track.input.speechiness;
            instrumentalness = instrumentalness += track.input.instrumentalness;
            valence = valence += track.input.valence;
            tempo = tempo += track.input.tempo;

            if (trackKey +1 >= genreValue.length) {
                avgObject[genreKey] = avgObject[genreKey] || {};
                avgObject[genreKey].danceability = {}; avgObject[genreKey].danceability = getHighLow(danceability / genreValue.length);
                avgObject[genreKey].energy = {}; avgObject[genreKey].energy = getHighLow(energy / genreValue.length);
                avgObject[genreKey].key = {}; avgObject[genreKey].key = getHighLow(key / genreValue.length);
                avgObject[genreKey].loudness = {}; avgObject[genreKey].loudness = getHighLow(loudness / genreValue.length);
                avgObject[genreKey].mode = {}; avgObject[genreKey].mode = getHighLow(mode / genreValue.length);
                avgObject[genreKey].speechiness = {}; avgObject[genreKey].speechiness = getHighLow(speechiness / genreValue.length);
                avgObject[genreKey].instrumentalness = {}; avgObject[genreKey].instrumentalness = getHighLow(instrumentalness / genreValue.length);
                avgObject[genreKey].valence = {}; avgObject[genreKey].valence = getHighLow(valence / genreValue.length);
                avgObject[genreKey].tempo = {}; avgObject[genreKey].tempo = getHighLow(tempo / genreValue.length);
                if (index >= Object.keys(data.musicCats).length) {
                    callback(avgObject)
                } else {
                    genreCallback();
                }
            } else {
                trackCallback();
            }
        });

    });
}

function normalise (data, avgObject, callback) {
    let final = {}, index = 0;

    async.eachOfSeries(data.musicCats, (genreValue, genreKey, genreCallback) => {
        index ++;

        async.eachOfSeries(genreValue, (track, trackKey, trackCallback) => {
            let add = true;

            if (track.input.danceability > avgObject[genreKey]["danceability"].high || track.input.danceability < avgObject[genreKey]["danceability"].low) {
                add = false;
            }
            if (track.input.energy > avgObject[genreKey]["energy"].high || track.input.energy < avgObject[genreKey]["energy"].low) {
                add = false;
            }
            if (track.input.key > avgObject[genreKey]["key"].high || track.input.key < avgObject[genreKey]["key"].low) {
                add = false;
            }
            if (track.input.loudness > avgObject[genreKey]["loudness"].high || track.input.loudness < avgObject[genreKey]["loudness"].low) {
                add = false;
            }
            if (track.input.mode > avgObject[genreKey]["mode"].high || track.input.mode < avgObject[genreKey]["mode"].low) {
                add = false;
            }
            if (track.input.speechiness > avgObject[genreKey]["speechiness"].high || track.input.speechiness < avgObject[genreKey]["speechiness"].low) {
                add = false;
            }
            if (track.input.instrumentalness > avgObject[genreKey]["instrumentalness"].high || track.input.instrumentalness < avgObject[genreKey]["instrumentalness"].low) {
                add = false;
            }
            if (track.input.valence > avgObject[genreKey]["valence"].high || track.input.valence < avgObject[genreKey]["valence"].low) {
                add = false;
            }
            if (track.input.tempo > avgObject[genreKey]["tempo"].high || track.input.tempo < avgObject[genreKey]["tempo"].low) {
                add = false;
            }

            if (add) {
                final[genreKey] = final[genreKey] || [];
                final[genreKey].push(track);
            }

            if (trackKey +1 >= genreValue.length) {
                if (index >= Object.keys(data.musicCats).length) {
                    console.log(Object.keys(final).length)
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

module.exports = (data, callback) => {
    grabHighLow(data, avgObject => {
        normalise(data, avgObject, finishedDataSet => {
            callback(finishedDataSet);
        });
    });
};