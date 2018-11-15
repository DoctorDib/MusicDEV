const brain = require('brain.js');
const async = require('async');
const config = require('../config/config');

const spotify = require('./spotifyApi');

let overallCount = 0;

let initial = {
    errors: {
        overall: 0,
        Pop: 0,
        Workout: 0,
        HipHop: 0,
        Chill: 0,
        ElectronicAndDance: 0,
        RnB: 0,
        Party: 0,
        Focus: 0,
        Rock: 0,
        Sleep: 0,
        Romance: 0,
        Jazz: 0,
        Gaming: 0,
        Dinner: 0,
        Travel: 0,
    },
    count: {
        overall: 0,
        Pop: 0,
        Workout: 0,
        HipHop: 0,
        Chill: 0,
        ElectronicAndDance: 0,
        RnB: 0,
        Party: 0,
        Focus: 0,
        Rock: 0,
        Sleep: 0,
        Romance: 0,
        Jazz: 0,
        Gaming: 0,
        Dinner: 0,
        Travel: 0,
    },
    percent: {
        overall: 100,
        Pop: 100,
        Workout: 100,
        HipHop: 100,
        Chill: 100,
        ElectronicAndDance: 100,
        RnB: 100,
        Party: 100,
        Focus: 100,
        Rock: 100,
        Sleep: 100,
        Romance: 100,
        Jazz: 100,
        Gaming: 100,
        Dinner: 100,
        Travel: 100,
    }
};

function round(input, dec){
    return Number(Math.round(input+'e'+dec)+'e-'+dec);
}

function workout(expected, actual, callback){
    if(expected !== actual){
        initial.errors[expected] ++;
        initial.errors.overall ++;

        initial.percent[expected] = 100 - ((initial.errors[expected] / initial.count[expected])*100);
        initial.percent.overall = 100 - ((initial.errors.overall / initial.count.overall) *100);
    }

    callback();
}

function check(outcome) {
    let high = 0;
    let highLabel;

    for (index in outcome){

        /*console.log("A: " + high);
        console.log("B: " + outcome[index]);
        console.log(outcome[index] > high ? "A is higher" : " A is not higher")
        console.log("======");*/
        let tmpOut = round(outcome[index], 5);
        if(tmpOut > high){
            high = tmpOut;
            highLabel = index;
        }
    }

    return highLabel;
}

let catNum = 0;
let mainNum = 0;

module.exports = function(spotifyApi, netOptions, data) {

    console.log(netOptions)

    async.eachOfSeries(data, function (mainValue, mainKey, mainCallback) {

        mainNum ++;
        let net = new brain.NeuralNetwork(config.predict);
        net.fromJSON(netOptions.memory[mainKey]);

        async.eachOfSeries(mainValue, function (catValue, catKey, catCallback) {
            catNum ++;
            async.eachOfSeries(catValue, function (trackValue, trackKey, trackCallback) {

                initial.count[catKey] ++;
                initial.count.overall ++;

                let outcome = net.run(trackValue.input)

                workout(catKey, check(outcome), function(){
                    console.log(mainKey)
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

            if (catNum >= Object.keys(mainValue).length){
                catNum = 0;
                if (mainNum >= Object.keys(data).length){
                    console.log("===============GENRE=================")
                    console.log("Pop: " + round(initial.percent.Pop, 2) + "% - " + initial.errors.Pop + "/" + initial.count.Pop);
                    console.log("HipHop: " + round(initial.percent.HipHop, 2) + "% - " + initial.errors.HipHop + "/" + initial.count.HipHop);
                    console.log("RnB: " + round(initial.percent.RnB, 2) + "% - " + initial.errors.RnB + "/" + initial.count.RnB);
                    console.log("Rock: " + round(initial.percent.Rock, 2) + "% - " + initial.errors.Rock + "/" + initial.count.Rock);
                    console.log("Jazz: " + round(initial.percent.Jazz, 2) + "% - " + initial.errors.Jazz + "/" + initial.count.Jazz);
                    console.log("===============ACTIVITY=================")
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
                    console.log(round(initial.percent.overall, 2) + "%");
                    console.log("================================================")
                } else {
                    mainCallback();
                }

            } else {
                catCallback();
            }
        });

    });
};