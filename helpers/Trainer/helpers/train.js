const brain = require('brain.js');

const config = require('../config/config');

function readInputs(stream, data) {
    for (let i = 0; i < data.length; i++) {
        stream.write(data[i]);
    }
    // let it know we've reached the end of the inputs
    stream.endInputs();
}

function logIt(data){
    console.log(">>", data)
}

let test = 500;

module.exports = function(dictionary, callback) {
    let configTrain = config.train;
    config.log = logIt;

    let net = new brain.NeuralNetwork(configTrain);

    const trainStream = new brain.TrainStream({
        neuralNetwork: net,
        /**
         * Write training data to the stream. Called on each training iteration.
         */
        floodCallback: function() {
            readInputs(trainStream, dictionary);
        },
        /**
         * Called when the network is done training.
         */
        doneTrainingCallback: function(obj) {
            console.log(`trained in ${ obj.iterations } iterations with error: ${ obj.error }`);
            callback(net);
        }
    });

    console.log("Started training...")
    readInputs(trainStream, dictionary);
};