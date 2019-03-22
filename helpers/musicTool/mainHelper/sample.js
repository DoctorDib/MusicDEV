const brain = require('brain.js');
const async = require('async');
const fs = require('fs');
const config = require('../../../config/config');
const predict = require('../helpers/predict');

let catNum = 0;

let initial = {
    errors: {},
    count: {},
    percent: {},
    incorrectCount: {}
};

function workout(expected, actual, callback){
    if (expected !== actual) {


        if (!initial.errors.hasOwnProperty(expected)) initial.errors[expected] = 0;
        initial.errors[expected] ++;

        if (!initial.percent.hasOwnProperty(expected)) initial.percent[expected] = 100;
        initial.percent[expected] = 100 - ((initial.errors[expected] / initial.count[expected]) * 100);

        if (!initial.incorrectCount.hasOwnProperty(expected)) initial.incorrectCount[expected] = {};
        if (!initial.incorrectCount[expected].hasOwnProperty(actual)) initial.incorrectCount[expected][actual] = 0;
        initial.incorrectCount[expected][actual] ++;
    }

    callback(expected !== actual);
}

function round(input, dec) {
    return  Number( Math.round( Number( input.toFixed( 10 ) ) +'e'+dec ) +'e-'+dec );
}

module.exports = (spotifyApi, netOptions, data, callback) => {
    //let net = new brain.NeuralNetwork(config.classification_config.predict);
    let net = new brain.NeuralNetwork();
    let exportJSON = [];

    net.fromJSON(netOptions.memory);

    catNum ++;
    async.eachOfSeries(data, (trackValue, trackKey, trackCallback) => {
        let catKey = Object.keys(trackValue.output)[0]; // Grabbing the expected Genre
        predict(net, trackValue.input, (resp) => {

            if (!initial.count.hasOwnProperty(catKey)) initial.count[catKey] = 0;
            initial.count[catKey]++;

            workout(catKey, resp, incorrect => {
                if (incorrect) exportJSON.push({correct: catKey, predicted:resp, features: trackValue});

                //console.log(`======================${catKey}======================`);
                if (!initial.percent.hasOwnProperty(catKey)) initial.percent[catKey] = 100;
                //console.log(catKey + ": " + round(initial.percent[catKey], 2) + "%");

                if (trackKey+1 >= data.length) {
                    console.log("======================SAMPLES======================");

                    let overallPercentage = 0;
                    for (let genre in initial.percent) {
                        if (initial.percent.hasOwnProperty(genre)) {
                            let print = '';

                            let outOf = initial.count[genre] - initial.errors[genre];
                            if (genre !== "overall") {
                                print = `${genre} ${round(initial.percent[genre], 2)}% - ${outOf}/${initial.count[genre]}`;
                            }

                            overallPercentage += Number(round(initial.percent[genre], 2));
                            console.log(print)
                        }
                    }

                    overallPercentage = overallPercentage / 9;

                    let finalAccuracy = round(overallPercentage, 2);
                    console.log("======================OVERALL======================");
                    console.log(`ACCURACY: ${finalAccuracy}%`);
                    console.log("===================================================");

                    console.log(initial.incorrectCount)

                    fs.writeFile("./tests/incorrectSamples.json", JSON.stringify(exportJSON), (err) => {
                        if (err) return console.error(err);
                        console.log("File has been created");
                        callback(finalAccuracy);
                    });
                } else {
                    trackCallback()
                }
            });
        });
    });
};