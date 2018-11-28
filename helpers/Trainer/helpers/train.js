const brain = require('brain.js');
const async = require('async');
const config = require('../config/config');
const push = require('./pushbullet');

let error = 0, iteration = 'default';
let timerStart=0;

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

    console.log("=========================================================")
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
    let num = 0;

    formatData(limit, dictionary, (formattedData) => {
        num++;
        timer(true);

        let tmpNumber = formattedData.length;
        let mainNetConfig = {
            log: logIt,
            hiddenLayers: [tmpNumber/10, tmpNumber/10]
        };

        netConfig = Object.assign(config.config, mainNetConfig);
        let netsObject = new brain.NeuralNetwork(netConfig);

        console.log("Training started:")
        netsObject.trainAsync(formattedData, config.train)
            .then(res => {
                let bodyData = `Finished: \nError: ${error}\nIteration: ${iteration}\nTimer: ${timer(false)}`;
                push.send({title: "Finished task", body: bodyData})
                netsObject = netsObject.toJSON();
                console.log("Finished and returning")
                callback(netsObject);
            })
            .catch(err => {
                console.log(err);
            });
    });
};