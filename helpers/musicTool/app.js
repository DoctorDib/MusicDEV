// ==== Training models ==== \\
const trainer = require('./helpers/train');
const recommender = require('./helpers/recommend');
//const trainer = require('./helpers/train-synaptic');

const spotify = require('./helpers/spotifyApi');
const sample = require('./mainHelper/sample');
const predict = require('./helpers/predict');
const push = require('./helpers/pushbullet');
const neo4j = require('./helpers/neo4j');
const config = require('../../config/config');
const learn = require('./mainHelper/learn');

const builder = require('./mainHelper/build');
const processData = require('./mainHelper/process');

const client_id = config.spotify.client_id;
const client_secret = config.spotify.client_secret;
const redirect_uri = config.spotify.spotify_callback;

const fs = require('fs');
const async = require('async');
const brain = require('brain.js');
const _ = require('underscore');
const SpotifyWebApi = require('spotify-web-api-node');
const MongoClient = require('mongodb').MongoClient;

const inputTwo = process.argv[2];
const inputThree = process.argv[3];

const timeoutIntervals = 125;
let timeoutCount = 0;

const Spotify = require('machinepack-spotify');
const spotifyApi = new SpotifyWebApi({
    clientId : client_id,
    clientSecret : client_secret,
    redirectUri : redirect_uri
});

function setUpAccount(callback) {
    Spotify.getAccessToken({
        clientId: client_id,
        clientSecret: client_secret,
    })
    .exec({
        error: err => {
            console.log("Access Token: " + err)
        },
        success: access => {
            spotifyApi.setAccessToken(access);
            console.log("ACCESS TOKEN SENT");
            callback();
        }
    });
}

function endProgram(error) {
    if (error) {
        console.log("Something went wrong... closing program");
    } else {
        console.log("------------------------------------------------");
        console.log("Please insert command in the following format...");
        console.log("    - Initial Training:");
        console.log("        - node app.js learn initial || node app.js learn [NUMBER OF TRACKS PER GENRE]");
        console.log("    - Process:");
        console.log("        - node app.js cut [PERCENTAGE (per track)]");
        console.log("    - Train:");
        console.log("        - node app.js train");
        console.log("    - Predict:");
        console.log("        - node app.js predict [TRACK URI]");
        console.log("    - Sample:");
        console.log("        - node app.js sample");
        console.log("    - Relate:");
        console.log("        - node app.js relate");
        console.log("    - Build:");
        console.log("        - node app.js build [NUMBER OF JSON files to process]");
        console.log("------------------------------------------------");
    }
    process.exit(1);
}

function writeTextFile(fileName, data, callback) {
    fs.writeFile(fileName, JSON.stringify(data), (err) => {
        if (err) return console.error(err);
        console.log("File has been created");
        callback();
    });
}

Object.defineProperty(Array.prototype, 'chunk', {
    value: function (chunkSize) {
        let temporal = [];
        for (let index = 0; index < this.length; index+= chunkSize){
            temporal.push(this.slice(index,index+chunkSize));
        }
        return temporal;
    }
});

MongoClient.connect(`mongodb://localhost:${config.mongo_settings.port}/${config.mongo_settings.name}`, function (err, database) {
    if (err) return console.error(err);
    const db = database.db(config.mongo_settings.name);
    let useCollection, saveCollection;

    const mongoAction = {
        save: (collection, id, value, callback) => {
            mongoAction.checkDelete(collection, id, () => {
                collection.insert({id: id, [id]: value});
                callback();
            });
        },
        checkDelete: (collection, id, mongoCallback) => {
            collection.findOne({"id": id}, (err, respData) => {
                console.log("Searching");
                if (respData !== null) {
                    // Saving to existing record
                    console.log(`Found and now deleting ${collection}`);
                    collection.drop((err, delOK) => {
                        mongoCallback();
                    });
                } else {
                    console.log(collection, ` does not exit...`);
                    mongoCallback();
                }
            });
        }
    };

    const run = {
        process: function () {
            useCollection = db.collection("masterMusicCats");
            saveCollection = db.collection("samples");

            useCollection.findOne({}).then(data => { // TODO - LOOK INTO INDEXING THE DATA FROM THE DATABASE
                if (!data || Object.keys(data.musicCats).length !== 9) {
                    console.warn("No music categories found... please teach me by running the following command")
                    console.log("                   - node app.js learn initial") // TODO - Temp.
                    endProgram(true);
                }

                processData(data, newData => {
                    console.log("Starting to save now")
                    saveCollection.findOne({"id": 'musicCats'}, (err, respData) => {

                        writeTextFile('./tests/trainingSample.json', newData.trainingSample, () => {
                            writeTextFile('./tests/testingSample.json', newData.testingSample, () => {
                                if (respData === null) {
                                    // Insert new record
                                    console.log("Inserting new record to Database");
                                    saveCollection.insert({id: "musicCats", trainingSet: newData.trainingSample, testingSet: newData.testingSample});
                                } else {
                                    // Replace with existing one.
                                    console.log("Existing record found...");
                                    saveCollection.drop((err, delOK) => {
                                        if (err) return console.log("ERRRRROR");
                                        console.log("Replacing existing record");
                                        saveCollection.insert({id: "musicCats", trainingSet: newData.trainingSample, testingSet: newData.testingSample});
                                    });
                                }
                            });
                        });
                    });
                });
            });
        },
        learn: function () {
            let limit = false;
            saveCollection = db.collection("masterMusicCats");
            if (inputThree && inputThree !== "initial") {
                // Default save location - musicCats
                saveCollection = db.collection("musicCats");
                limit = Number(inputThree);
            }

            learn(spotifyApi, limit, (featureCount, newMemory) => {
                saveCollection.findOne({"id": 'musicCats'}, (err, respData) => {
                    if (respData === null) {
                        // Insert new record
                        console.log("Inserting new record to Database");
                        saveCollection.insert({id: "musicCats", "musicCats": newMemory, "counter": featureCount});
                    } else {
                        // Replace with existing one.
                        console.log("Existing record found...");
                        saveCollection.drop((err) => {
                            if (err) return console.log("ERRRRROR");
                            console.log("Replacing existing record");
                            saveCollection.insert({id: "musicCats", "musicCats": newMemory, "counter": featureCount});
                        });
                    }
                });
            });
        },
        train: function () {
            // Using data from saved collection musicCats and saving to musicMemory
            useCollection = db.collection("samples");
            saveCollection = db.collection("musicMemory");

            useCollection.findOne({trainingSet: {$exists: true}})
                .then(function (data) {
                    if (err) return console.log(err);

                    function start(dataData) {
                        console.log(`Attempt ${timeoutCount++}`);
                        trainer(spotifyApi, data.trainingSet, trainResp => {
                            if (trainResp.error) {
                                if (timeoutCount <= timeoutIntervals) {
                                    start(dataData);
                                } else {
                                    console.log("ERROR: Unable to run application.");
                                    endProgram(true);
                                }
                            } else {
                                saveCollection.findOne({"id": 'memory'}, (err, respData) => {
                                    console.log("Searching");
                                    if (respData === null) {
                                        // Saving a new record
                                        console.log("Saving as new record")
                                        saveCollection.insert({id: "memory", "memory": trainResp.training});
                                    } else {
                                        // Saving to existing record
                                        saveCollection.drop((err, delOK) => {
                                            if (err) return console.log("ERRRRROR");
                                            console.log("Replacing with existing record");
                                            saveCollection.insert({id: "memory", "memory": trainResp.training})
                                        });
                                    }
                                });
                            }
                        });
                    }
                    start(data);
                }).catch((err) => {
                    console.log(err);
            });
        },
        predict: function () {
            useCollection = db.collection("musicMemory");

            useCollection.findOne({"id": 'memory'}, (err, resp) => {
                if (!resp || resp === null) {
                    console.log("Memory not found... Please teach me...");
                    endProgram(true);
                } else {
                    let net = new brain.NeuralNetwork(config.classification_config.predict);
                    net.fromJSON(resp.memory);

                    let uri = inputThree.split(inputThree.indexOf("http") !== -1 ? '/' : ':');
                    uri = uri[uri.length - 1];

                    spotify.grabSingleFeature(spotifyApi, uri, (data) => {
                        console.log(data);
                        predict(net, data, (resp) => {
                            let finalResponse = `I think it is:\n  - ${resp}`;
                            console.log(finalResponse)
                        });
                    });
                }
            });
        },
        sample: function () {
            const useCollectionMemory = db.collection("musicMemory");
            const useCollectionCats = db.collection("samples");

            // Default = "test" - TrainingSet = "train"
            const sampleSelection = inputThree === "train" ? "trainingSet" : "testingSet";

            useCollectionMemory.findOne({"id": 'memory'}, (err, resp) => {
                if (!resp || resp === null) {
                    console.log("Memory not found... Please teach me...");
                    endProgram(true);
                } else {
                    useCollectionCats.findOne({[sampleSelection]: {$exists: true}}, (err, cats) => {
                        console.log(cats[sampleSelection])
                        if (!cats || cats === null) {
                            console.log("Cats not found... please teach me");
                            endProgram(true);
                        } else {
                            sample(spotifyApi, resp, cats[sampleSelection]);
                        }
                    });
                }
            });
        },
        relate: function () {
            async.eachOfSeries(config.recommendation_config.genres, function (genre, genreKey, genreCallback) {
                neo4j('masterLearn', {genre: genre}, function () {
                    if(genreKey+1 >= config.recommendation_config.genres.length) {
                        console.log("Done")
                    } else {
                        genreCallback();
                    }
                });
            });
        },
        build: function () {
            if (!inputThree) {
                console.log("Please enter the number of files you wish to process.");
            } else {
                neo4j('masterDelete', {}, function () { // Resetting
                    neo4j('initialise', { id: "Spotify", genres: config.recommendation_config.genres }, () => { // Initialising database
                        const arr = _.range(parseInt(inputThree));
                        useCollection = db.collection("musicMemory");
                        saveCollection = db.collection("masterMusic");

                        // Resetting collection
                        mongoAction.checkDelete(saveCollection, "master", () => {
                            useCollection.findOne({"id": 'memory'}, (err, resp) => {
                                if (!resp || resp === null) {
                                    console.log("Memory not found... Please teach me...");
                                    endProgram(true);
                                } else {
                                    console.log("Found")
                                    builder(spotifyApi, arr, resp);
                                }
                            });
                        });
                    });
                });
            }
        }
    };

    setUpAccount(() => {
        if (run.hasOwnProperty(inputTwo)) {
            // Runs main application
            run[inputTwo]();
        } else {
            // Default error shows which commands are valid
            endProgram(false);
        }
    });
});