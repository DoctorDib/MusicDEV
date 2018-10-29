const dictionary =  require('./Data/dictionary');

const secretKeys = require('../secretKeys.json');
const client_id = secretKeys.spotify.client_id;
const client_secret = secretKeys.spotify.client_secret;
const redirect_uri = secretKeys.spotify.spotify_callback;

const async = require('async');
const brain = require('brain.js');
const arraySort = require('array-sort');
const SpotifyWebApi = require('spotify-web-api-node');
const MongoClient = require('mongodb').MongoClient;

let timer = 100;
let coolDown = 0;

function logIt(data){
    let split = JSON.stringify(data).split(': ');
    console.log("=========================================================");
    console.log("Iteration NO.: " + split[1].split(',')[0])
    console.log("--")
    console.log("ERROR: " + split[split.length-1])
}

const genreAndActivity = {
    genre: ['Pop', 'HipHop', 'RnB', 'Rock', 'Jazz'],
    activity: ['Workout', 'Chill', 'ElectronicAndDance', 'Party', 'Focus', 'Sleep', 'Romance', 'Gaming', 'Dinner', 'Travel']
};


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
    iterations: 50000000,    // the maximum times to iterate the training data --> number greater than 0
    errorThresh: 0.005,   // the acceptable error percentage from training data --> number between 0 and 1
    log: logIt,           // true to use console.log, when a function is supplied it is used --> Either true or a function
    logPeriod: 25,        // iterations between logging out --> number greater than 0
    learningRate: 0.01,    // scales with delta to effect training rate --> number between 0 and 1
    momentum: 0.1,        // scales with next layer's change value --> number between 0 and 1
    callback: null,       // a periodic call back that can be triggered while training --> null or function
    callbackPeriod: 10,   // the number of iterations through the training data between callback calls --> number greater than 0
    timeout: Infinity,     // the max number of milliseconds to train for --> number greater than 0
    reinforce: true,
    keepNetworkIntact:true
};

const Spotify = require('machinepack-spotify');
const spotifyApi = new SpotifyWebApi({
    clientId : client_id,
    clientSecret : client_secret,
    redirectUri : redirect_uri
});

function setUpAccount(callback){
    Spotify.getAccessToken({
        clientId: client_id,
        clientSecret: client_secret,
    })
        .exec({
            error: function (err) {
                console.log("Access Token: " + err)
            },
            success: function (access) {
                spotifyApi.setAccessToken(access);
                console.log("ACCESS TOKEN SENT");
                callback();
            }
        });
}

function grabSingleFeature(uri, callback){
    spotifyApi.getAudioFeaturesForTrack(uri)
        .then(function(resp) {
            let value = resp.body;
            let features = {
                danceability: value.danceability,
                energy: value.energy,
                key: value.key,
                loudness: value.loudness,
                speechiness: value.speechiness,
                acousticness: value.acousticness,
                instrumentalness: value.instrumentalness,
                liveness: value.liveness,
                valence: value.valence,
                tempo: value.tempo
            };
            callback(features);
        }, function(err) {
            //console.log(trackURIList)
            console.log("PLAYLIST TRACKS ERROR: " + err);
        });
}

let totalKey = 0;

function grabFeatures(type, trackURIList, callback) {
    //console.log([trackURIList])
    let memory = {genre: [], activity: []};
    spotifyApi.getAudioFeaturesForTracks([trackURIList])
        .then(function(data) {
            //console.log(data.body.audio_features)
            async.eachOfSeries(data.body.audio_features, function (value, key, trackLoopCallback) {
                if(!value){
                    if(key+1 >= data.body.audio_features.length){
                        callback(memory);
                    } else {
                        trackLoopCallback();
                    }
                } else {
                    let features = {
                        input:{
                            danceability: value.danceability,
                            energy: value.energy,
                            key: value.key / 1000,
                            loudness: value.loudness / 1000,
                            speechiness: value.speechiness,
                            acousticness: value.acousticness,
                            instrumentalness: value.instrumentalness,
                            liveness: value.liveness,
                            valence: value.valence,
                            tempo: value.tempo / 1000
                        },
                        output: {
                            [type]:1
                        }
                    };

                    if (genreAndActivity.genre.indexOf(type) === -1){
                        memory.activity.push(features);
                    } else {
                        memory.genre.push(features)
                    }

                    if(key+1 >= data.body.audio_features.length){
                        callback(memory);
                    } else {
                        trackLoopCallback();
                    }
                }
            });
        }, function(err) {
            //console.log(trackURIList)
            console.log("PLAYLIST TRACKS ERROR: " + err);
        });
}

function grabPlaylists(type, URI, callback){
    spotifyApi.getPlaylist(null, URI)
        .then(function(data) {
            let trackURIList = [];
            let memory = {activity: [], genre: []};

            async.eachOfSeries(data.body.tracks.items, function (value, chunkKey, playlistCallback) {
                //console.log(data.body.tracks.items)
                if((chunkKey+1) !== data.body.tracks.items.length && trackURIList.length < 50){
                    if(value.track !== null){
                        trackURIList.push(value.track.id);
                    }
                    playlistCallback();
                } else {
                    timer += coolDown;
                    setTimeout(function(){
                        grabFeatures(type, trackURIList, function(resp){

                            if (genreAndActivity.genre.indexOf(type) === -1){
                                memory.activity = [...memory.activity, ...resp.activity];
                            } else {
                                memory.genre = [...memory.genre, ...resp.genre];
                            }

                            if((chunkKey+1) !== data.body.tracks.items.length){
                                trackURIList = [];
                                playlistCallback(); // continue on the list
                            } else {
                                callback(memory);
                            }
                        });
                    }, timer);
                }
            });
        }, function(err) {
            if(err.statusCode === 404){
                console.log(URI + " does not exist...");
                process.exit(1);
            }
            console.log("Something went wrong!", err);
        });
}

function trainSingle (data, callback){
    let genreNet = new brain.NeuralNetwork(config);
    let activityNet = new brain.NeuralNetwork(config);


    genreNet.trainAsync(data.genre, trainConfig)
        .then((log) => {
            console.log(log)
            console.log("Finished training...");

            activityNet.trainAsync(data.activity, trainConfig)
                .then((log) => {
                    console.log(log)
                    console.log("Finished training...");
                    callback([genreNet, activityNet]);
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
}

function train(data, callback) {
    const net = new brain.NeuralNetwork(config);
    console.log("Training has be initiated...");

    async.eachOfSeries(data, function (trainValues, mainKey, dictionaryCallback) {

        if (!data.length) {
            callback()
        } else {
            console.log(data.length);
            console.log(">>>>>", trainValues);
            net.trainAsync(trainValues, trainConfig)
                .then((log) => {
                    console.log(log);
                    if (!trainValues.length) {
                        callback(net)
                    } else {
                        if (mainKey + 1 !== data.length) {
                            console.log("Training complete...");
                            dictionaryCallback();
                        } else {
                            console.log("Finished training...")
                            callback(net)
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }
    });
}

function sortObject(obj) {
    let arr = [];
    let prop;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) {
        return a.value - b.value;
    });
    arr.sort(function(a, b) {
        return a.value - b.value;
    });
    return arr; // returns array
}

MongoClient.connect("mongodb://localhost:27017/musicDEV", function(err, database) {
    if(err) return console.error(err);

    const db = database.db("musicDEV");

    let memory = {activity: [], genre: []};

    setUpAccount(function(){
        console.log("=========================================================================================");
        let useCollection;
        let saveCollection;

        if (process.argv[2] === "learn") {
            // Grabbing categories and then saving to - musicCats
            saveCollection = db.collection("musicCats");

            async.eachOfSeries(dictionary, function (dictionaryValue, mainKey, dictionaryCallback) {
                async.eachOfSeries(dictionaryValue.uriList, function (uriValue, uriKey, uriCallback) {
                    grabPlaylists(dictionaryValue.category, uriValue, function(data){

                        if (data.activity.length > 1){
                            memory.activity = [...memory.activity, ...data.activity];
                        } else {
                            memory.genre = [...memory.genre, ...data.genre];
                        }

                        if(uriKey+1 >= dictionaryValue.uriList.length){
                            if((mainKey+1) !== dictionary.length){
                                totalKey ++;
                                dictionaryCallback();
                            } else {
                                saveCollection.findOne({"id": 'musicCats'}, function(err, respData) {
                                    if(respData === null){
                                        // Insert new record
                                        console.log("Inserting new record to Database")
                                        saveCollection.insert({id: "musicCats", "musicCats": memory});
                                    } else {
                                        // Replace with existing one.
                                        console.log("Existing record found...")
                                        console.log("Replacing existing record")
                                        saveCollection.findOneAndReplace({id: "musicCats"}, {"musicCats": memory});
                                    }
                                });
                            }
                        } else {
                            console.log("==========================================================================");
                            console.log(dictionaryValue.category + ' - ' + (uriKey+1) + '/' + dictionaryValue.uriList.length);
                            console.log("TOTAL: " + ' - ' + (mainKey+1) + '/' + dictionary.length);
                            console.log("==========================================================================");
                            uriCallback();
                        }
                    });
                });
            });
        } else if (process.argv[2] === "train") {
            // Using data from saved collection musicCats and saving to musicMemory
            useCollection = db.collection("musicCats");
            saveCollection = db.collection("musicMemory");

            useCollection.findOne({})
                .then(function(data){
                    console.log(data)
                    if(data !== null){
                        trainSingle(data.musicCats, function(resp){
                            saveCollection.findOne({"id": 'memory'}, function(err, respData) {
                                if(respData === null){
                                    // Saving a new record
                                    console.log("Saving as new record")
                                    saveCollection.insert({id: "memory", "memory": {genre: resp[0].toJSON(), activity: resp[1].toJSON()}});
                                } else {
                                    // Saving to existing record
                                    console.log("Replacing with existing record")
                                    saveCollection.findOneAndReplace({id: "memory"}, {id: "memory", "memory": {genre: resp[0].toJSON(), activity: resp[1].toJSON()}})
                                }
                            });
                        });
                    } else {
                        console.log("Database not found, please run:");
                        console.log("    - node app.js learn");
                        process.exit(1);
                    }
                })
                .catch(function(err){
                    console.log(err);
                });
        } else if(process.argv[2] === "predict") {
            useCollection = db.collection("musicMemory");

            let selected = process.argv[4];

            useCollection.findOne({"id": 'memory'}, function(err, resp) {
                if(!resp || resp === null){
                    console.log("Memory not found... Please teach me...");
                    process.exit(1);
                } else {
                    console.log("Found")

                    console.log("Settings: ", resp.memory[selected]);
                    let net = new brain.NeuralNetwork(config);
                    net.fromJSON(resp.memory[selected]);

                    let uri = process.argv[3].split(':');
                    uri = uri[uri.length - 1];

                    grabSingleFeature(uri, function(data){
                        console.log(data);
                        let outcome = net.run(data);
                        console.log("================================================");
                        console.log(outcome);
                        console.log("================================================");

                        /*let cheese = sortObject(outcome);
                        arraySort(cheese, 'foo');
                        console.log(cheese)*/
                    });
                }
            });
        } else {
            console.log("Please insert command in the following format...");
            console.log("    - Train:");
            console.log("        -node app.js train");
            console.log("    - Predict:");
            console.log("        -node app.js predict [URI] [GENRE]");
        }
    });
});


/**
 * INSERTS:
 * node app.js trainMaster null musicMemory
 * node app.js train null musicCats
 * node app.js learn null musicCats
 * node app.js predict *URI* musicMemory
 */