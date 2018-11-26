const brain = require('brain.js');
const async = require('async');
const config = require('../config/config');
const push = require('./pushbullet');

let error, iteration;
let type='', timerStart=0;

function timer(startTimer){
    if(startTimer){
        timerStart = 0;
        timerStart = new Date();
        return;
    }
    return (new Date() - timerStart) / 1000 + " seconds";
}

function logIt(data){
    data = JSON.stringify(data);
    iteration = data.split("iterations:").pop().split(',')[0];
    error = data.split("error:").pop().replace('"', '');

    console.log("=================" + type.toUpperCase() + "====================")
    console.log("Iterations: " + iteration);
    console.log("Error: " + error);
    console.log("Duration: " + (new Date() - timerStart) / 1000 + " seconds")
}

function formatData(limit, data, callback){
    let final = [], num = 0;

    async.eachOfSeries(data, (loopValue, loopKey, loopCallback) => {
        num ++;
        if(limit){
            let tmpLimit = loopValue.length * (limit / 100);
            final = [...final, ...loopValue.slice(0, Math.ceil(tmpLimit))];
        } else {
            final = [...final, ...loopValue];
        }

        if(num === Object.keys(data).length){
            console.log("finished")
            callback(final);
        } else {
            console.log("learning")
            loopCallback();
        }
    });
}

module.exports = function(SpotifyApi, dictionary, limit, callback) {
    let num = 0, netsObject = {} ;

    let mainNetConfig = {log: logIt};
    netConfig = Object.assign(mainNetConfig, config.config);

    async.eachOfSeries(dictionary, (loopValue, loopKey, loopCallback) => {

        if(loopKey === "activity"){
            loopKey = "genre"
            loopValue = dictionary.genre;
        }

        type = loopKey;

        formatData(limit, loopValue, (formattedData) => {
            timer(true);
            let tmpNumber = Math.round(formattedData.length / 10);
            let tmpConf = {
                hiddenLayers: [tmpNumber, tmpNumber],
                inputSize: 1,
                inputRange: formattedData.length / 10,
                outputSize: 1
            };

            let tmpFinalConf = Object.assign(netConfig, tmpConf);
            netsObject[loopKey] = new brain.NeuralNetwork(tmpFinalConf);

            console.log("Training started:")
            netsObject[loopKey].trainAsync(formattedData, config.train)
                .then(res => {
                    let bodyData = `Finished: ${loopKey}\nError: ${error}\nIteration: ${iteration}\nTimer: ${timer(false)}`;

                    push.send({title: "Finished task", body: bodyData})

                    netsObject[loopKey] = netsObject[loopKey].toJSON();
                    if(num === Object.keys(dictionary).length) {
                        console.log("Finished and returning")
                        callback(netsObject);
                    } else {
                        console.log("Next")
                        loopCallback();
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        });
    });
};