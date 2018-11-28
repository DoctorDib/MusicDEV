const brain = require('brain.js');
const async = require('async');
const config = require('../config/config');

const spotify = require('./spotifyApi');

let overallCount = 0, catNum = 0, mainNum = 0;

let initial = {
    errors: {
        overall: 0,
        Workout: 0,
        Chill: 0,
        ElectronicAndDance: 0,
        Party: 0,
        Focus: 0,
        Sleep: 0,
        Romance: 0,
        Gaming: 0,
        Dinner: 0,
        Travel: 0,
    },
    count: {
        overall: 0,
        Workout: 0,
        Chill: 0,
        ElectronicAndDance: 0,
        Party: 0,
        Focus: 0,
        Sleep: 0,
        Romance: 0,
        Gaming: 0,
        Dinner: 0,
        Travel: 0,
    },
    percent: {
        overall: 100,
        Workout: 100,
        Chill: 100,
        ElectronicAndDance: 100,
        Party: 100,
        Focus: 100,
        Sleep: 100,
        Romance: 100,
        Gaming: 100,
        Dinner: 100,
        Travel: 100,
    }
};

function round(input, dec){
    return Number(Math.round(input+'e'+dec)+'e-'+dec);
}

function workout(expected, actual, callback){
    if (expected !== actual) {
        initial.errors[expected] ++;
        initial.errors.overall ++;

        initial.percent[expected] = 100 - ((initial.errors[expected] / initial.count[expected])*100);
        initial.percent.overall = 100 - ((initial.errors.overall / initial.count.overall) *100);
    }

    callback();
}

function check(outcome) {
    let high = 0, highLabel;

    for (index in outcome) {
        let tmpOut = round(outcome[index], 5);
        if (tmpOut > high) {
            high = tmpOut;
            highLabel = index;
        }
    }

    return highLabel;
}

module.exports = function(spotifyApi, netOptions, data) {
    let net = new brain.NeuralNetwork(config.predict);

    net.fromJSON(netOptions.memory);

    async.eachOfSeries(data, function (catValue, catKey, catCallback) {

        catNum ++;
        async.eachOfSeries(catValue, function (trackValue, trackKey, trackCallback) {
            let outcome = net.run(trackValue.input);

            initial.count[catKey] ++;
            initial.count.overall ++;

            workout(catKey, check(outcome), function(){
                console.log(catKey + ": " + round(initial.percent[catKey], 2) + "%");
                console.log("===============================================")
                console.log("OVERALL: " + round(initial.percent.overall, 2) + "%");
                console.log("===============================================")

                if(trackKey >= catValue){
                    catCallback();
                } else {
                    trackCallback()
                }
            });
        });

        if (catNum >= Object.keys(data).length){
            catNum = 0;
            console.log("===============SAMPLES=================")
            console.log("Workout: " + round(initial.percent.Workout, 2) + "% - " + initial.errors.Workout + "/" + initial.count.Workout);
            console.log("Chill: " + round(initial.percent.Chill, 2) + "% - " + initial.errors.Chill + "/" + initial.count.Chill);
            console.log("ElectronicAndDance: " + round(initial.percent.ElectronicAndDance, 2) + "% - " + initial.errors.ElectronicAndDance + "/" + initial.count.ElectronicAndDance);
            console.log("Party: " + round(initial.percent.Party, 2) + "% - " + initial.errors.Party + "/" + initial.count.Party);
            console.log("Focus: " + round(initial.percent.Focus, 2) + "% - " + initial.errors.Focus + "/" + initial.count.Focus);
            console.log("Sleep: " + round(initial.percent.Sleep, 2) + "% - " + initial.errors.Sleep + "/" + initial.count.Sleep);
            console.log("Romance: " + round(initial.percent.Romance, 2) + "% - " + initial.errors.Romance + "/" + initial.count.Romance);
            console.log("Gaming: " + round(initial.percent.Gaming, 2) + "% - " + initial.errors.Gaming + "/" + initial.count.Gaming);
            console.log("Dinner: " + round(initial.percent.Dinner, 2) + "% - " + initial.errors.Dinner + "/" + initial.count.Dinner);
            console.log("Travel: " + round(initial.percent.Travel, 2) + "% - " + initial.errors.Travel + "/" + initial.count.Travel);
            console.log("===============OVERALL=================")
            console.log("Overall: " + initial.errors.overall + "/" + initial.count.overall)
            console.log(round(initial.percent.overall, 2) + "%");
            console.log("================================================")

        } else {
            catCallback();
        }

    });
};