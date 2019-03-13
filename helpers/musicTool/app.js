//const dictionary =  require('./Data/dictionary');
const dictionary =  require('../Data/genreDictionary'); // For genre
//const dictionary =  require('./Data/playlistSmall');
const trackDictionary =  require('../Data/trackDictionary');
const config = require('../../config/config');

// ==== Training models ==== \\
const trainer = require('./helpers/train');
const recommender = require('./helpers/recommend');
//const trainer = require('./helpers/train-synaptic');

const spotify = require('./helpers/spotifyApi');
const sample = require('./helpers/sample');
const predict = require('./helpers/predict');
const push = require('./helpers/pushbullet');
const neo4j = require('./helpers/neo4j');
const processData = require('./helpers/process');
const recommendConfig = require('../../config/config');

const client_id = config.spotify.client_id;
const client_secret = config.spotify.client_secret;
const redirect_uri = config.spotify.spotify_callback;

const async = require('async');
const brain = require('brain.js');
const _ = require('underscore');
const SpotifyWebApi = require('spotify-web-api-node');
const MongoClient = require('mongodb').MongoClient;

const fs = require('fs');

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

function defaultError() {
    console.log("------------------------------------------------");
    console.log("Please insert command in the following format...");
    console.log("    - Initial Training:");
    console.log("        - node app.js learn initial");
    console.log("    - Cut:");
    console.log("        - node app.js cut [PERCENTAGE (per track)]");
    console.log("    - Train:");
    console.log("        - node app.js train");
    console.log("    - Sample:");
    console.log("        - node app.js sample");
    console.log("    - Predict:");
    console.log("        - node app.js predict [URI] [GENRE]");
    console.log("    - build:");
    console.log("        - node app.js build [NUMBER OF (num).json]");
    console.log("------------------------------------------------");
    process.exit(1);
}

function readTextFile(fileText, callback) {
    fs.readFile(fileText, 'utf8', (err, data) => {
        if (err) return console.log(err);
        callback(JSON.parse(data).playlists);
    });
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

    let memory = {};
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
                    console.log(`${collection} does not exit...`);
                    mongoCallback();
                }
            });
        }
    };

    const run = {
        grabGenre: function (respMemory, inputData, genreCallback) {
            let net = new brain.NeuralNetwork(config.classification_config.predict);
            net.fromJSON(respMemory);

            predict(net, inputData, (resp) => {
                genreCallback(resp);
            });
        },
        grabGenreUserPlaylist: function (username, playlist, callback) {
            useCollection = db.collection("musicMemory");
            saveCollection = db.collection(username);

            useCollection.findOne({"id": 'memory'}, (err, resp) => {
                if (!resp || resp === null) {
                    console.log("Memory not found... Please teach me...");
                    process.exit(1);
                } else {
                    console.log("Found");

                    run.grabGenre(resp.memory, playlist, (resp) => {
                        saveCollection.insert({id: "user", "playlist": resp});
                        callback();
                    });
                }
            });
        },
        process: function () {
            useCollection = db.collection("masterMusicCats");
            saveCollection = db.collection("samples");

            useCollection.findOne({}).then(data => { // TODO - LOOK INTO INDEXING THE DATA FROM THE DATABASE
                if (!data || Object.keys(data.musicCats).length !== 9) {
                    console.warn("No music categories found... please teach me by running the following command")
                    console.log("                   - node app.js learn initial") // TODO - Temp.
                    process.exit(1);
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
            let limit, type;

            let savedUriTracks = {};
            let savedTracks = {};

            limit = false;
            saveCollection = db.collection("masterMusicCats");
            if (process.argv[3] && process.argv[3] !== "initial") {
                // Default save location - musicCats
                saveCollection = db.collection("musicCats");
                limit = Number(process.argv[3]);
            }

            function finished(memory, savedTracks, callback) {
                let dupes = {};
                for (let uri in savedTracks) {
                    if (savedTracks.hasOwnProperty(uri)) {
                        if (Object.keys(savedTracks[uri]).length > 1) {

                            let high = 0;
                            let selectedType = '';

                            for (let type in savedTracks[uri]) {
                                if(savedTracks[uri].hasOwnProperty(type) && type !== "track"){
                                    if(savedTracks[uri][type] > high) {
                                        high = savedTracks[uri][type];
                                        selectedType = type;
                                    }
                                }
                            }

                            savedTracks[uri].track.features.output = { [selectedType] : 1 };
                            memory[selectedType].push( savedTracks[uri].track.features);
                            dupes[uri] = savedTracks[uri];
                        }
                    }
                }
                console.log("Writing to file");
                fs.writeFile("../../dupes.json", JSON.stringify(dupes), (err) => {
                    if (err) return console.error(err);
                    console.log("File has been created");
                    callback(memory);
                });
            }

            function final (memory, savedTracks) {
                let featureCount = {};

                // Looping through grabbing min and max for each feature

                for (let genre in memory) {
                    if (memory.hasOwnProperty(genre)) {
                        for (let track in memory[genre]) {
                            if (memory[genre].hasOwnProperty(track)) {
                                for (let feature in memory[genre][track].input) {
                                    if (memory[genre][track].input.hasOwnProperty(feature)) {
                                        let val = memory[genre][track].input[feature];

                                        if (!featureCount.hasOwnProperty(feature)){
                                            featureCount[feature] = {min : val, max: val, count: 1};
                                        } else {
                                            if (val > featureCount[feature].max) featureCount[feature].max = val;
                                            if (val < featureCount[feature].min) featureCount[feature].min = val;
                                            featureCount[feature].count ++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                console.log(featureCount);

                finished(memory, savedTracks, (newMemory) => {
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
            }

             async.eachOfSeries(dictionary, (dictionaryValue, mainKey, dictionaryCallback) => {
                 if (dictionaryValue.hasOwnProperty("category") && dictionaryValue.hasOwnProperty("uriList")) {
                     type = dictionaryValue.category;

                     async.eachOfSeries(dictionaryValue.uriList, (uriValue, uriKey, uriCallback) => {
                         spotify.grabPlaylists(spotifyApi, type, uriValue, (data) => {

                             let tracks = [];
                             async.eachOfSeries(data, (track, trackKey, trackCallback) => {
                                 if (savedUriTracks.hasOwnProperty(track.id)) {
                                     console.log("Already existing track");
                                     // Wanting to save both so I can compare the genres that the data has
                                     if(!savedTracks.hasOwnProperty(track.id)) {
                                         savedTracks[track.id] = {
                                             track: track
                                         };
                                     }

                                     if (!savedTracks[track.id].hasOwnProperty(type)) savedTracks[track.id][type] = 0;

                                     savedTracks[track.id][type] = savedTracks[track.id][type] += 1; // Recording how many times it has popped up
                                     console.log(savedTracks[track.id][type])
                                 } else {
                                     savedUriTracks[track.id] = track;
                                     tracks.push(track.features);
                                 }

                                 if (trackKey+1 >= data.length) {
                                     if (!memory[type]) memory[type] = [];
                                     memory[type] = [...memory[type], ...tracks];
                                     if (limit) memory[type] = memory[type].splice(0, limit);
                                     if (uriKey + 1 >= dictionaryValue.uriList.length) {
                                         if ((mainKey + 1) !== dictionary.length) {
                                             dictionaryCallback();
                                         } else {
                                             final(memory, savedTracks);
                                         }
                                     } else {
                                         console.log("==========================================================================");
                                         console.log(type + ' - ' + (uriKey + 1) + '/' + dictionaryValue.uriList.length);
                                         console.log("TOTAL: " + ' - ' + (mainKey + 1) + '/' + dictionary.length);
                                         console.log("==========================================================================");
                                         if (limit && memory[type].length >= limit) {
                                             if (mainKey + 1 === dictionary.length) {
                                                 final(memory, savedTracks);
                                             } else {
                                                 dictionaryCallback();
                                             }
                                         } else {
                                             uriCallback();
                                         }
                                     }
                                 } else {
                                     trackCallback();
                                 }
                             });
                         });
                     });
                 }
            });
        },
        learnTracks: function () {
            // Grabbing categories and then saving to - musicCats
            saveCollection = db.collection("musicCats");

            async.eachOfSeries(trackDictionary, (dictionaryValue, mainKey, dictionaryCallback) => {
                if (dictionaryValue.hasOwnProperty("uriList")) {
                    async.eachOfSeries(dictionaryValue.uriList, (uriValue, uriKey, uriCallback) => {

                        if (dictionaryValue.hasOwnProperty("category")) {
                            spotify.grabFeatures(spotifyApi, dictionaryValue.category, uriValue, data => {

                                if (!memory[dictionaryValue.category]) memory[dictionaryValue.category] = [];

                                memory[dictionaryValue.category] = [...memory[dictionaryValue.category], ...data];


                                if (uriKey + 1 >= dictionaryValue.uriList.length) {
                                    if ((mainKey + 1) !== trackDictionary.length) {
                                        dictionaryCallback();
                                    } else {
                                        saveCollection.findOne({"id": 'musicCats'}, (err, respData) => {
                                            if (respData === null) {
                                                // Insert new record
                                                console.log("Inserting new record to Database");
                                                saveCollection.insert({id: "musicCats", "musicCats": memory});
                                            } else {
                                                // Replace with existing one.
                                                console.log("Existing record found...");
                                                saveCollection.drop((err, delOK) => {
                                                    if (err) return console.log("ERRRRROR");
                                                    console.log("Replacing existing record");
                                                    saveCollection.insert({id: "musicCats", "musicCats": memory});
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    console.log("==========================================================================");
                                    console.log(dictionaryValue.category + ' - ' + (uriKey + 1) + '/' + dictionaryValue.uriList.length);
                                    console.log("TOTAL: " + ' - ' + (mainKey + 1) + '/' + dictionary.length);
                                    console.log("==========================================================================");
                                    uriCallback();
                                }
                            });
                        }
                    });
                }
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
                                    process.exit(1);
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
                    process.exit(1);
                } else {
                    console.log("Found")

                    let net = new brain.NeuralNetwork(config.classification_config.predict);
                    net.fromJSON(resp.memory);

                    let splitVal = ':';
                    if (process.argv[3].indexOf("http") !== -1) {
                        splitVal = '/';
                    }

                    let uri = process.argv[3].split(splitVal);
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
            let sampleSelection = process.argv[3] === "train" ? "trainingSet" : "testingSet";

            useCollectionMemory.findOne({"id": 'memory'}, (err, resp) => {
                if (!resp || resp === null) {
                    console.log("Memory not found... Please teach me...");
                    process.exit(1);
                } else {
                    useCollectionCats.findOne({[sampleSelection]: {$exists: true}}, (err, cats) => {
                        console.log(cats[sampleSelection])
                        if (!cats || cats === null) {
                            console.log("Cats not found... please teach me");
                            process.exit(1);
                        } else {
                            sample(spotifyApi, resp, cats[sampleSelection])
                        }
                    });
                }
            });
        },
        relate: function () {
            async.eachOfSeries(recommendConfig.recommendation_config.genres, function (genre, genreKey, genreCallback) {
                neo4j('masterLearn', {genre: genre}, function () {
                    if(genreKey+1 >= recommendConfig.recommendation_config.genres.length) {
                        console.log("Done")
                    } else {
                        genreCallback();
                    }
                });
            });
        },
        build: function () {
            neo4j('masterDelete', {}, function () { // Resetting
                neo4j('initialise', { id: "Spotify", genres: recommendConfig.recommendation_config.genres }, () => { // Initialising database

                    const arr = _.range(parseInt(process.argv[3]));
                    console.log(arr)

                    let finalObject = {}, finalArray = [], count = 0;

                    useCollection = db.collection("musicMemory");
                    saveCollection = db.collection("masterMusic");

                    // Resetting collection
                    mongoAction.checkDelete(saveCollection, "master", () => {
                        useCollection.findOne({"id": 'memory'}, function (err, resp) {
                            if (!resp || resp === null) {
                                console.log("Memory not found... Please teach me...");
                                process.exit(1);
                            } else {
                                console.log("Found")
                                async.eachOfSeries(arr, function (value, keyFiles, callbackFiles) {
                                    //mpd.slice.1000-1999.json
                                    //"../Data/trackData/mpd.slice." + value + ".json"
                                    readTextFile(`../Data/trackData/mpd.slice.${value+1}000-${value+1}999.json`, function (json) {
                                        async.eachOfSeries(json, function (jsonValue, jsonKey, jsonCallback) {
                                            let uriArray = [];
                                            async.eachOfSeries(jsonValue.tracks, function (trackValue, trackKey, trackCallback) {
                                                if (trackValue.hasOwnProperty("track_uri")) {
                                                    let uri = trackValue.track_uri.split(':');
                                                    uri = uri[uri.length - 1];
                                                    count++;

                                                    if (finalObject.hasOwnProperty(uri)) {
                                                        console.log("DUPLICATED")
                                                        if (jsonKey + 1 >= Object.keys(json).length) {
                                                            if (keyFiles + 1 >= arr.length) {

                                                                async.eachOfSeries(recommendConfig.recommendation_config.genres, function (genre, genreKey, genreCallback) {
                                                                    neo4j('masterLearn', {genre: genre}, function () {
                                                                        if (genreKey + 1 >= recommendConfig.recommendation_config.genres.length) {
                                                                            let body = `Database build has been completed with ${finalArray.length} entries.`;
                                                                            push.send({
                                                                                title: "Database build complete",
                                                                                body: body
                                                                            });
                                                                        } else {
                                                                            genreCallback();
                                                                        }
                                                                    });
                                                                });
                                                            } else {
                                                                console.log('========================')
                                                                console.log("Next file")
                                                                let body = `${value+1}/${arr.length} complete`;
                                                                push.send({
                                                                    title: "Partial",
                                                                    body: body
                                                                });

                                                                callbackFiles();
                                                            }
                                                        } else {
                                                            jsonCallback();
                                                        }
                                                    } else {

                                                        uriArray.push(uri); // Adding uri to array
                                                        finalObject[uri] = {name: trackValue.track_name, id: uri}; // Creating empty object for duplicated data detection

                                                        if (trackKey + 1 >= Object.keys(jsonValue.tracks).length) {
                                                            uriArray = uriArray.chunk(50);
                                                            async.eachOfSeries(uriArray, function (uriArrayValue, uriArrayKey, uriArrayCallback) {
                                                                setTimeout(function () {
                                                                    spotify.grabFeatures(spotifyApi, false, uriArrayValue, (data) => {
                                                                        async.eachOfSeries(data, function (featuresValue, featuresKey, featuresCallback) {
                                                                            let ident = featuresValue.id;
                                                                            delete featuresValue.id; // Sorting out data

                                                                            // Grabbing the predicted Genre
                                                                            run.grabGenre(resp.memory, featuresValue, (genre) => {

                                                                                finalObject[ident].features = featuresValue;
                                                                                finalObject[ident].genre = genre;
                                                                                finalArray.push(finalObject[ident]);

                                                                                let tmpObj = finalObject[ident];

                                                                                neo4j('create', {
                                                                                    count: count,
                                                                                    params: tmpObj,
                                                                                    single: false
                                                                                }, function (resp) {
                                                                                    if (!resp.success) console.log("Create Error: ", resp.error);
                                                                                    // else continue with life

                                                                                    let finalResponse = `==================================================\nID: ${count}\nName: ${finalObject[ident].name}\nGenre: ${genre}`;
                                                                                    console.log(finalResponse)

                                                                                    if (featuresKey + 1 >= data.length) {
                                                                                        if (uriArrayKey + 1 >= uriArray.length) {
                                                                                            if (jsonKey + 1 >= Object.keys(json).length) {
                                                                                                if (keyFiles + 1 >= arr.length) {

                                                                                                    async.eachOfSeries(recommendConfig.recommendation_config.genres, function (genre, genreKey, genreCallback) {
                                                                                                        neo4j('masterLearn', {genre: genre}, function () {
                                                                                                            if (genreKey + 1 >= recommendConfig.recommendation_config.genres.length) {
                                                                                                                let body = `Database build has been completed with ${finalArray.length} entries.`;
                                                                                                                push.send({
                                                                                                                    title: "Database build complete",
                                                                                                                    body: body
                                                                                                                });
                                                                                                            } else {
                                                                                                                genreCallback();
                                                                                                            }
                                                                                                        });
                                                                                                    });
                                                                                                } else {

                                                                                                    let body = `${value+1}/${arr.length} complete`;
                                                                                                    push.send({
                                                                                                        title: "Partial",
                                                                                                        body: body
                                                                                                    });
                                                                                                    callbackFiles();
                                                                                                }
                                                                                            } else {
                                                                                                jsonCallback();
                                                                                            }
                                                                                        } else {
                                                                                            uriArrayCallback();
                                                                                        }
                                                                                    } else {
                                                                                        featuresCallback();
                                                                                    }
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                }, 100);
                                                            });
                                                        } else {
                                                            trackCallback();
                                                        }
                                                    }
                                                }
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    });
                });
            });
        },
        recommend: function () { // TODO DOES NOT WORK AT THE MOMENT, ONLY FOR TESTING PURPOSES
            let uri=process.argv[3]; // String
            /*let genres=process.argv[4]; // Array
            let quantity=process.argv[5];*/ // TODO - NOT REQUIRED AT THE MOMENT

            /*genres = JSON.stringify(genres)
            genres = JSON.parse(genres);*/

            let genres = ["Blues"]

            let tmpRecommendations={};

            async.eachOfSeries(genres, function (genre, genreKey, genreCallback) {
                recommender(spotifyApi, uri, genre, resp => {
                    console.log("Response: ")

                    if (genreKey <= genres.length) {
                        // Finished
                        callback()
                    } else {
                        genreCallback()
                    }
                });
            });
        }
    };

    setUpAccount(function () {
        if (run[process.argv[2]]) {
            // Runs main application
            run[process.argv[2]]();
        } else {
            // Default error shows which commands are valid
            defaultError();
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