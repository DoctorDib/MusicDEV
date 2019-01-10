const brain = require('brain.js');
const async = require('async');
const config = require('../config/config');

const predict = require('./predict')

const spotify = require('./spotifyApi');

let overallCount = 0, catNum = 0, mainNum = 0;

let initial = {
    errors: {
        overall: 0,
        Pop: 0,
        HipHop: 0,
        Chill: 0,
        ElectronicAndDance: 0,
        RnB: 0,
        Rock: 0,
        Jazz: 0,
        Classical: 0,
        Blues: 0
    },
    count: {
        overall: 0,
        Pop: 0,
        HipHop: 0,
        Chill: 0,
        ElectronicAndDance: 0,
        RnB: 0,
        Rock: 0,
        Jazz: 0,
        Classical: 0,
        Blues: 0
    },
    percent: {
        overall: 100,
        Pop: 100,
        HipHop: 100,
        Chill: 100,
        ElectronicAndDance: 100,
        RnB: 100,
        Rock: 100,
        Jazz: 100,
        Classical: 100,
        Blues: 100
    }
};

function workout(expected, actual, callback){
    if (expected !== actual) {
        initial.errors[expected] ++;
        initial.errors.overall ++;

        initial.percent[expected] = 100 - ((initial.errors[expected] / initial.count[expected]) * 100);
        initial.percent.overall = 100 - ((initial.errors.overall / initial.count.overall) * 100);
    }

    callback();
}

function round(input, dec){
    input = Number(input.toFixed(10));
    return Number(Math.round(input+'e'+dec)+'e-'+dec);
}

module.exports = function(spotifyApi, netOptions, data) {
    let net = new brain.NeuralNetwork(config.predict);

    net.fromJSON(netOptions.memory);

    async.eachOfSeries(data, function (catValue, catKey, catCallback) {

        catNum ++;
        async.eachOfSeries(catValue, function (trackValue, trackKey, trackCallback) {
            predict(net, trackValue.input, (resp) => {
                initial.count[catKey] ++;
                initial.count.overall ++;

                workout(catKey, resp, function(){
                    console.log(catKey + ": " + round(initial.percent[catKey], 2) + "%");
                    console.log("OVERALL: " + round(initial.percent.overall, 2) + "%");
                    console.log("===============================================")

                    if(trackKey >= catValue){
                        catCallback();
                    } else {
                        trackCallback()
                    }
                });
            });
        });

        if (catNum >= Object.keys(data).length){
            catNum = 0;
            console.log("===============SAMPLES=================")
            console.log("Pop: " + round(initial.percent.Pop, 2) + "% - " + initial.errors.Pop + "/" + initial.count.Pop);
            console.log("HipHop: " + round(initial.percent.HipHop, 2) + "% - " + initial.errors.HipHop + "/" + initial.count.HipHop);
            console.log("Chill: " + round(initial.percent.Chill, 2) + "% - " + initial.errors.Chill + "/" + initial.count.Chill);
            console.log("ElectronicAndDance: " + round(initial.percent.ElectronicAndDance, 2) + "% - " + initial.errors.ElectronicAndDance + "/" + initial.count.ElectronicAndDance);
            console.log("RnB: " + round(initial.percent.RnB, 2) + "% - " + initial.errors.RnB + "/" + initial.count.RnB);
            console.log("Rock: " + round(initial.percent.Rock, 2) + "% - " + initial.errors.Rock + "/" + initial.count.Rock);
            console.log("Jazz: " + round(initial.percent.Jazz, 2) + "% - " + initial.errors.Jazz + "/" + initial.count.Jazz);
            console.log("Classical: " + round(initial.percent.Classical, 2) + "% - " + initial.errors.Classical + "/" + initial.count.Classical);
            console.log("Blues: " + round(initial.percent.Blues, 2) + "% - " + initial.errors.Blues + "/" + initial.count.Blues);
            console.log("===============OVERALL=================")
            console.log("Overall: " + initial.errors.overall + "/" + initial.count.overall)
            console.log(round(initial.percent.overall, 2) + "%");
            console.log("================================================")

        } else {
            catCallback();
        }

    });
};