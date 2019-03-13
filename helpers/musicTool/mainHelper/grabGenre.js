const brain = require('brain.js');
const config = require('../../../config/config');
const predict = require('../helpers/predict');

module.exports = function (respMemory, input, callback) {
    let net = new brain.NeuralNetwork(config.classification_config.predict);
    net.fromJSON(respMemory);

    predict(net, input, (resp) => {
        callback(resp);
    });
};