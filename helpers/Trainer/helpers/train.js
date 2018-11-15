const brain = require('brain.js');
const async = require('async');
const config = require('../config/config');

let type = '';

function logIt(data){
    data = JSON.stringify(data);
    let iteration = data.split("iterations:").pop().split(',')[0];
    let error = data.split("error:").pop();

    console.log("Type: " + type);
    console.log("Iterations: " + iteration);
    console.log("Error: " + error);
    console.log("=====================================")
}

function formatData(limit, data, callback){
    let final = [];
    let num = 0;

    async.eachOfSeries(data, function (loopValue, loopKey, loopCallback) {
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

module.exports = function(dictionary, limit, callback) {
    let final = {}, num = 0;

    let netConfig = {log: logIt};
    netConfig = Object.assign(netConfig, config.config);

    async.eachOfSeries(dictionary, function (loopValue, loopKey, loopCallback) {
        type = loopKey;
        num ++;
        formatData(limit, loopValue, (data) => {
            let net = new brain.NeuralNetwork(netConfig);
            console.log("Training started:")
            net.trainAsync(data, config.train)
                .then(res => {
                    final[loopKey] = net.toJSON();
                    if(num === Object.keys(dictionary).length) {
                        console.log("Finished and returning")
                        callback(final);
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