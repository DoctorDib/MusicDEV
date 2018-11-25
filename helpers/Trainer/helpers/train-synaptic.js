const synaptic = require('synaptic'); // this line is not needed in the browser
const Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;


let myNetwork = new Architect.Perceptron(15, 50, 1)
let trainer = new Trainer(myNetwork)

const async = require('async');

const push = require('./pushbullet');
const spotify = require('./spotifyApi');



function formatData(limit, data, callback){
    let final = [], num = 0;
    let sample = [];

    async.eachOfSeries(data, function (loopValue, loopKey, loopCallback) {
        console.log("===========")
        num ++;
        if(limit){
            let tmpLimit = loopValue.length * (limit / 100);
            final = [...final, ...loopValue.slice(0, Math.ceil(tmpLimit))];
            sample = [...sample, ...loopValue];
        } else {
            final = [...final, ...loopValue];
            sample = [...sample, ...loopValue];
        }

        if(num === Object.keys(data).length){
            console.log("finished")
            callback({trainSet: final, testSet: sample});
        } else {
            console.log("learning")
            loopCallback();
        }
    });
}

const configger = {
    rate: 0.01,
    iterations: 200000,
    error: 0.01,
    shuffle: true,
    log: 25,

}

module.exports = function(spotifyApi, dictionary, limit, callback) {
    let final = {}, num = 0;

    async.eachOfSeries(dictionary, function (loopValue, loopKey, loopCallback) {
        type = loopKey;
        num ++;
        formatData(limit, loopValue, (dataering) => {
            console.log("Training started:")

            console.log(dataering.trainSet)

            trainer.train(dataering.trainSet, configger)





            /*spotify.grabSingleFeature(spotifyApi, uri, function(respData){

                let predicted_class = dt.predict(respData);

                console.log(predicted_class);
            });*/

        });
    });
};