const async = require('async');
const DecisionTree = require('decision-tree');

const push = require('./pushbullet');
const spotify = require('./spotifyApi');

const class_name = "output";
const features = ["danceability", "energy", "key", "loudness", "speechiness", "acousticness", "instrumentalness",
    "liveness", "valence", "tempo"
];

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

module.exports = function(spotifyApi, dictionary, limit, callback) {
    let final = {}, num = 0;

    async.eachOfSeries(dictionary, function (loopValue, loopKey, loopCallback) {
        type = loopKey;
        num ++;
        formatData(limit, loopValue, (data) => {
            console.log("Training started:")


            var dt = new DecisionTree(data.trainSet, class_name, features);
            let accuracy = dt.evaluate(data.testSet);
            console.log(accuracy);

            let uri = process.argv[4].split(':');
            uri = uri[uri.length - 1];

            spotify.grabSingleFeature(spotifyApi, uri, function(respData){

                let predicted_class = dt.predict(respData);

                console.log(predicted_class);
            });

        });
    });
};