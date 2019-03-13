const brain = require('brain.js');
const async = require('async');
const fs = require('fs');
const config = require('../../../config/config');
const predict = require('../helpers/predict');

let catNum = 0;

let initial = {
    errors: {
        overall: 0,
        Blues: 0,
        Pop: 0,
        HipHop: 0,
        Chill: 0,
        ElectronicAndDance: 0,
        RnB: 0,
        Rock: 0,
        Jazz: 0,
        Classical: 0,
    },
    count: {
        overall: 0,
        Blues: 0,
        Pop: 0,
        HipHop: 0,
        Chill: 0,
        ElectronicAndDance: 0,
        RnB: 0,
        Rock: 0,
        Jazz: 0,
        Classical: 0,
    },
    percent: {
        overall: 100,
        Blues: 100,
        Pop: 100,
        HipHop: 100,
        Chill: 100,
        ElectronicAndDance: 100,
        RnB: 100,
        Rock: 100,
        Jazz: 100,
        Classical: 100,
    }
};

function workout(expected, actual, callback){
    if (expected !== actual) {
        initial.errors[expected] ++;
        initial.errors.overall ++;

        initial.percent[expected] = 100 - ((initial.errors[expected] / initial.count[expected]) * 100);
        initial.percent.overall = 100 - ((initial.errors.overall / initial.count.overall) * 100);
    }

    callback(expected !== actual);
}

function round(input, dec) {
    return Number( Math.round( Number( input.toFixed( 10 ) ) +'e'+dec ) +'e-'+dec );
}

module.exports = (spotifyApi, netOptions, data) => {
    let net = new brain.NeuralNetwork(config.classification_config.predict);
    let exportJSON = [];

    net.fromJSON(netOptions.memory);

    catNum ++;
    async.eachOfSeries(data, (trackValue, trackKey, trackCallback) => {
        let catKey = Object.keys(trackValue.output)[0]; // Grabbing the expected Genre

        predict(net, trackValue.input, (resp) => {
            initial.count[catKey]++;
            initial.count.overall++;

            workout(catKey, resp, incorrect => {
                if (incorrect) exportJSON.push({correct: catKey, predicted:resp, features: trackValue});

                console.log(`======================${catKey}======================`);
                console.log(catKey + ": " + round(initial.percent[catKey], 2) + "%");
                console.log("OVERALL: " + round(initial.percent.overall, 2) + "%");

                if (trackKey+1 >= data.length) {
                    console.log("======================SAMPLES======================");

                    for (let genre in initial.percent) {
                        if (initial.percent.hasOwnProperty(genre)) {
                            let print = '';

                            let outOf = initial.count[genre] - initial.errors[genre];
                            if (genre !== "overall") {
                                print = `${genre} ${round(initial.percent[genre], 2)}% - ${outOf}/${initial.count[genre]}`;
                            }
                            console.log(print);
                        }
                    }

                    console.log("======================OVERALL======================");
                    console.log(`Overall: ${initial.errors.overall}/${initial.count.overall}`);
                    console.log(`Accuracy: ${round(initial.percent["overall"], 2)}%`);
                    console.log("===================================================");

                    fs.writeFile("./tests/incorrectSamples.json", JSON.stringify(exportJSON), (err) => {
                        if (err) return console.error(err);
                        console.log("File has been created");
                    });
                } else {
                    trackCallback()
                }
            });
        });
    });
};