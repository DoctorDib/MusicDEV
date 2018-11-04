const {Bayes} = require('nodeml');
let bayes = new Bayes();


bayes.train({ 'loudness': 100, 'tempo': 200 }, "Workout");
bayes.train({ 'loudness': 100, 'tempo': 200 }, "Workout");
bayes.train({ 'loudness': 100, 'tempo': 200 }, "Workout");
bayes.train({ 'loudness': 100, 'tempo': 200 }, "Workout");
bayes.train({ 'loudness': 20, 'tempo': 2 }, "Sleep");
bayes.train({ 'loudness': 20, 'tempo': 2 }, "Sleep");
bayes.train({ 'loudness': 20, 'tempo': 2 }, "Sleep");
bayes.train({ 'loudness': 20, 'tempo': 2 }, "Sleep");
bayes.train({ 'loudness': 20, 'tempo': 2 }, "Sleep");

let result = bayes.test({'loudness': 20, 'tempo': 2,});
console.log(result); // this print {answer: , score: }





//const cache = require('memory-cache');
/*
const MongoClient = require('mongodb').MongoClient;
const async = require('async');
const brain = require('brain.js');

const config = {
    inputSize: 100,
    inputRange: 100,
    hiddenSizes: [20,20, 20, 20],
    outputSize: 100,
    learningRate: 0.01,
    decayRate: 0.999,
    binaryThresh: 0.5,     // ¯\_(ツ)_/¯
    hiddenLayers: [4],     // array of ints for the sizes of the hidden layers in the network
    activation: 'sigmoid'  // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh']
};

const trainConfig = {
    // Defaults values --> expected validation
    iterations: 1000000,    // the maximum times to iterate the training data --> number greater than 0
    errorThresh: 0.005,   // the acceptable error percentage from training data --> number between 0 and 1
    log: logIt,           // true to use console.log, when a function is supplied it is used --> Either true or a function
    logPeriod: 5,        // iterations between logging out --> number greater than 0
    learningRate: 0.01,    // scales with delta to effect training rate --> number between 0 and 1
    momentum: 0.1,        // scales with next layer's change value --> number between 0 and 1
    callback: null,       // a periodic call back that can be triggered while training --> null or function
    callbackPeriod: 10,   // the number of iterations through the training data between callback calls --> number greater than 0
    timeout: Infinity,     // the max number of milliseconds to train for --> number greater than 0
    reinforce: true,
    keepNetworkIntact:true
};

function logIt(test){
   console.log(test)
}

let memory = [
    {input: { a: 0.8, b: 0.945,c: 0.8, d: 0.945,e: 0.8, f: 0.945, }, output: {black: 1}},
    {input: { a: 0.25656, b: 0.2, c: 0.25656, d: 0.2, e: 0.25656, f: 0.2, }, output: {white: 1}},
];


let timer = 500
function train(callback){
    console.log("Training started")
    let net = new brain.NeuralNetwork(config);
    net.trainAsync(memory, trainConfig)
        .then(function(){
            console.log("Finished")
            callback(net.toJSON())
        }).catch(function(err){
            console.log(err);
        })
}
/**
MongoClient.connect("mongodb://localhost:27017/test", function(err, database) {
    if(err) return console.error(err);

    const db = database.db("test");
    const collection = db.collection('testSave');


    train(function(data){
        let net = new brain.NeuralNetwork(config);
        let output = net.fromJSON(data).run({ a: 0.3, b: 0.3});
        console.log(output)
    });
    /*collection.findOne({"id": 'memory'}, function(err, resp) {
        if(resp === null){
            console.log("Saved")
            collection.insert({"id": "memory", memory: train()});
        } else {
            console.log("Found")

            let net = new brain.NeuralNetwork();
            console.log(resp.memory)
            let output = net.fromJSON(resp.memory).run({ r: 0.55, g: 0.5, b: 0.4 });


            //let output = net;  // { white: 0.99, black: 0.002 }
            console.log(output);
        }
    });*/
/*});*/