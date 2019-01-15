//const dictionary =  require('./Data/dictionary');
const dictionary =  require('../Data/genreDictionary'); // For genre
//const dictionary =  require('./Data/playlistSmall');
const trackDictionary =  require('../Data/trackDictionary');
const config = require('./config/config');

// ==== Training models ==== \\
const trainer = require('./helpers/train');
const recommender = require('./helpers/recommend');
//const trainer = require('./helpers/train-synaptic');

const spotify = require('./helpers/spotifyApi');
const sample = require('./helpers/sample');
const predict = require('./helpers/predict');
const push = require('./helpers/pushbullet')

const secretKeys = require('../secretKeys.json');
const client_id = secretKeys.spotify.client_id;
const client_secret = secretKeys.spotify.client_secret;
const redirect_uri = secretKeys.spotify.spotify_callback;

const async = require('async');
const brain = require('brain.js');
const _ = require('underscore');
const SpotifyWebApi = require('spotify-web-api-node');
const MongoClient = require('mongodb').MongoClient;

const timeoutIntervals = 125;
let timeoutCount = 0;

const Spotify = require('machinepack-spotify');
const spotifyApi = new SpotifyWebApi({
    clientId : client_id,
    clientSecret : client_secret,
    redirectUri : redirect_uri
});

const genreAndActivity = {
    activity: ['Workout', 'Chill', 'ElectronicAndDance', 'Party', 'Focus', 'Sleep', 'Romance', 'Gaming', 'Dinner', 'Travel']
};

function round(input, dec) {
    console.log(input)
    console.log(Number(Math.round(input + 'e' + dec) + 'e-' + dec))
    return Number(Math.round(input + 'e' + dec) + 'e-' + dec);
}

function check(outcome) {
    let high = 0, highLabel;

    for (index in outcome) {
        let tmpOut = round(outcome[index], 2);

        if (tmpOut > high) {
            high = tmpOut;
            highLabel = index;
        }
    }

    return highLabel;
}

function setUpAccount(callback) {
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
    fs = require('fs')
    fs.readFile(fileText, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        callback(JSON.parse(data).playlists);
    });
}

Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize){
        var temporal = [];

        for (var i = 0; i < this.length; i+= chunkSize){
            temporal.push(this.slice(i,i+chunkSize));
        }

        return temporal;
    }
});

MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
    if (err) return console.error(err);
    const db = database.db("musicDEV");

    let memory = {};
    let accountSetup = false;
    let useCollection, saveCollection;

    const mongoAction = {
        save: (collection, id, value, callback) => {
            mongoAction.checkDelete(collection, id, () => {
                collection.insert({id: id, [id]: value});
                callback();
            });
        },
        insertArr: (collection, id, value) => {
            // Saving a new record
            console.log("Saving as new record")
            collection.update({"id":id}, {  $push: value} , { upsert: true });
        },
        checkDelete: (collection, id, mongoCallback) => {
            collection.findOne({"id": id}, function (err, respData) {
                console.log("Searching")
                if (respData !== null) {
                    // Saving to existing record
                    console.log(`Found and now deleting ${collection}`)
                    collection.drop(function (err, delOK) {
                        mongoCallback();
                    });
                } else {
                    console.log(`${collection} does not exit...`)
                    mongoCallback();
                }
            });
        }
    }

    const run = {
        grabGenre: function (respMemory, inputData, genreCallback) {
            let net = new brain.NeuralNetwork(config.predict);
            net.fromJSON(respMemory);

            predict(net, inputData, (resp) => {
                genreCallback(resp);
            });
        },
        grabGenreUserPlaylist: function (username, playlists, callback) {
            useCollection = db.collection("musicMemory");
            saveCollection = db.collection(username);

            useCollection.findOne({"id": 'memory'}, function (err, resp) {
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
        cut: function () {
            let memory = {}, catCount = 0;

            useCollection = db.collection("masterMusicCats");
            saveCollection = db.collection("musicCats");

            useCollection.findOne({}).then(function (data) {
                console.log(data)
                if (!data || Object.keys(data.musicCats).length !== 9) {
                    console.warn("No music categories found... please teach me by running the following command")
                    console.log("                   - node app.js learn initial") // TODO - Temp.
                    process.exit(1);
                }

                if (process.argv[3]) {
                    limit = Number(process.argv[3]);

                    if (limit > 100 || limit < 0) {
                        console.error("Limit is not in range: 0 - 100%");
                        process.exit(1);
                    }
                }

                async.eachOfSeries(data.musicCats, function (catValue, catKey, catCallback) {
                    catCount++;

                    console.log(`Cutting ${catKey}`)

                    let tmpLimit = Math.ceil(catValue.length * (limit / 100));
                    console.log(tmpLimit)

                    memory[catKey] = catValue.splice(0, tmpLimit);

                    if (catCount === Object.keys(data.musicCats).length) {
                        saveCollection.findOne({"id": 'musicCats'}, function (err, respData) {
                            if (respData === null) {
                                // Insert new record
                                console.log("Inserting new record to Database")
                                saveCollection.insert({id: "musicCats", "musicCats": memory});
                            } else {
                                // Replace with existing one.
                                console.log("Existing record found...")
                                saveCollection.drop(function (err, delOK) {
                                    if (err) return console.log("ERRRRROR")
                                    console.log("Replacing existing record")
                                    saveCollection.insert({id: "musicCats", "musicCats": memory});
                                });
                            }
                        });
                    } else {
                        catCallback();
                    }
                });
            });
        },
        learn: function () {
            let limit, type;

            limit = false
            saveCollection = db.collection("masterMusicCats");
            if (process.argv[3] && process.argv[3] !== "initial") {
                // Default save location - musicCats
                saveCollection = db.collection("musicCats");

                limit = Number(process.argv[3]);
            }

            async.eachOfSeries(dictionary, function (dictionaryValue, mainKey, dictionaryCallback) {
                type = dictionaryValue.category;

                async.eachOfSeries(dictionaryValue.uriList, function (uriValue, uriKey, uriCallback) {
                    spotify.grabPlaylists(spotifyApi, dictionaryValue.category, uriValue, (data) => {
                        if (!memory[type]) {
                            memory[type] = []
                        }

                        memory[type] = [...memory[type], ...data];

                        if (limit) {
                            memory[type] = memory[type].splice(0, limit);
                        }

                        if (uriKey + 1 >= dictionaryValue.uriList.length) {
                            if ((mainKey + 1) !== dictionary.length) {
                                dictionaryCallback();
                            } else {
                                saveCollection.findOne({"id": 'musicCats'}, function (err, respData) {
                                    if (respData === null) {
                                        // Insert new record
                                        console.log("Inserting new record to Database")
                                        saveCollection.insert({id: "musicCats", "musicCats": memory});
                                    } else {
                                        // Replace with existing one.
                                        console.log("Existing record found...")
                                        saveCollection.drop(function (err, delOK) {
                                            if (err) return console.log("ERRRRROR")
                                            console.log("Replacing existing record")
                                            saveCollection.insert({id: "musicCats", "musicCats": memory});
                                        });
                                    }
                                });
                            }
                        } else {
                            console.log("==========================================================================");
                            console.log(type + ' - ' + (uriKey + 1) + '/' + dictionaryValue.uriList.length);
                            console.log("TOTAL: " + ' - ' + (mainKey + 1) + '/' + dictionary.length);
                            console.log("==========================================================================");


                            if (limit && memory[type].length >= limit) {
                                if (mainKey + 1 === dictionary.length) {
                                    saveCollection.findOne({"id": 'musicCats'}, function (err, respData) {
                                        if (respData === null) {
                                            // Insert new record
                                            console.log("Inserting new record to Database")
                                            saveCollection.insert({id: "musicCats", "musicCats": memory});
                                        } else {
                                            // Replace with existing one.
                                            console.log("Existing record found...")
                                            saveCollection.drop(function (err, delOK) {
                                                if (err) return console.log("ERRRRROR")
                                                console.log("Replacing existing record")
                                                saveCollection.insert({id: "musicCats", "musicCats": memory});
                                            });
                                        }
                                    });
                                } else {
                                    dictionaryCallback();
                                }
                            } else {
                                uriCallback();
                            }
                        }
                    });
                });
            });
        },
        learnTracks: function () {
            // Grabbing categories and then saving to - musicCats
            saveCollection = db.collection("musicCats");

            async.eachOfSeries(trackDictionary, function (dictionaryValue, mainKey, dictionaryCallback) {
                async.eachOfSeries(dictionaryValue.uriList, function (uriValue, uriKey, uriCallback) {

                    spotify.grabFeatures(spotifyApi, dictionaryValue.category, uriValue, function (data) {

                        if (!memory[dictionaryValue.category]) {
                            memory[dictionaryValue.category] = []
                        }

                        memory[dictionaryValue.category] = [...memory[dictionaryValue.category], ...data]

                        if (uriKey + 1 >= dictionaryValue.uriList.length) {
                            if ((mainKey + 1) !== trackDictionary.length) {
                                dictionaryCallback();
                            } else {
                                console.log("Here")
                                saveCollection.findOne({"id": 'musicCats'}, function (err, respData) {
                                    if (respData === null) {
                                        // Insert new record
                                        console.log("Inserting new record to Database")
                                        saveCollection.insert({id: "musicCats", "musicCats": memory});
                                    } else {
                                        // Replace with existing one.
                                        console.log("Existing record found...")
                                        saveCollection.drop(function (err, delOK) {
                                            if (err) return console.log("ERRRRROR")
                                            console.log("Replacing existing record")
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
                });
            });
        },
        train: function () {
            // Using data from saved collection musicCats and saving to musicMemory
            useCollection = db.collection("musicCats");
            saveCollection = db.collection("musicMemory");

            useCollection.findOne({})
                .then(function (data) {
                    console.log(`Attempt ${timeoutCount++}`)
                    if (data !== null) {
                        trainer(spotifyApi, data.musicCats, (trainResp) => {
                            if (trainResp.error) {
                                if (timeoutCount <= timeoutIntervals) {
                                    run[process.argv[2]]();
                                } else {
                                    console.log("ERROR: Unable to run application.")
                                    process.exit(1)
                                }
                            } else {
                                console.log("Returned")
                                saveCollection.findOne({"id": 'memory'}, function (err, respData) {
                                    console.log("Searching")
                                    if (respData === null) {
                                        // Saving a new record
                                        console.log("Saving as new record")
                                        saveCollection.insert({id: "memory", "memory": trainResp.training});
                                    } else {
                                        // Saving to existing record
                                        saveCollection.drop(function (err, delOK) {
                                            if (err) return console.log("ERRRRROR");
                                            console.log("Replacing with existing record")
                                            saveCollection.insert({id: "memory", "memory": trainResp.training})
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        console.log("Database not found, please run:");
                        console.log("    - node app.js learn");
                        process.exit(1);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        predict: function () {
            useCollection = db.collection("musicMemory");

            useCollection.findOne({"id": 'memory'}, function (err, resp) {
                if (!resp || resp === null) {
                    console.log("Memory not found... Please teach me...");
                    process.exit(1);
                } else {
                    console.log("Found")

//                    console.log("Settings: ", trainResp.memory);
                    let net = new brain.NeuralNetwork(config.predict);
                    net.fromJSON(resp.memory);

                    let splitVal = ':';
                    if (process.argv[3].indexOf("http") !== -1) {
                        splitVal = '/';
                    }

                    let uri = process.argv[3].split(splitVal);
                    uri = uri[uri.length - 1];

                    spotify.grabSingleFeature(spotifyApi, uri, function (data) {
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
            let useCollectionMemory = db.collection("musicMemory");
            let useCollectionCats = db.collection("masterMusicCats");

            useCollectionMemory.findOne({"id": 'memory'}, function (err, resp) {
                if (!resp || resp === null) {
                    console.log("Memory not found... Please teach me...");
                    process.exit(1);
                } else {
                    useCollectionCats.findOne({}, (err, cats) => {
                        if (!cats || cats === null) {
                            console.log("Cats not found... please teach me");
                            process.exit(1);
                        } else {
                            sample(spotifyApi, resp, cats.musicCats)
                        }
                    });
                }
            });
        },
        build: function () {
            const arr = _.range(parseInt(process.argv[3]));
            console.log(arr)

            let finalObject = {};
            let finalArray = [];
            let count=0;

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
                            readTextFile("../Data/trackData/" + value + ".json", function (json) {
                                async.eachOfSeries(json, function (jsonValue, jsonKey, jsonCallback) {
                                    let uriArray = [];
                                    async.eachOfSeries(jsonValue.tracks, function (trackValue, trackKey, trackCallback) {
                                        let uri = trackValue.track_uri.split(':');
                                        uri = uri[uri.length - 1];
                                        uriArray.push(uri); // Adding uri to array
                                        finalObject[uri] = {name: trackValue.track_name, id: uri}; // Creating empty object

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

                                                                count++

                                                                let finalResponse = `==================================================\nID: ${count}\nName: ${finalObject[ident].name}\nGenre: ${genre}`;
                                                                console.log(finalResponse)

                                                                //mongoAction.insertArr(saveCollection, "master", {finalObject[ident].genre: finalObject[ident]})

                                                                if (featuresKey + 1 >= data.length) {
                                                                    if (uriArrayKey + 1 >= uriArray.length) {
                                                                        if (jsonKey + 1 >= Object.keys(json).length) {
                                                                            if (keyFiles + 1 >= arr.length) {
                                                                                mongoAction.save(saveCollection, "master", finalArray, () => {
                                                                                    let body = `Database build has been completed with ${finalArray.length} entries.`;
                                                                                    push.send({
                                                                                        title: "Database build complete",
                                                                                        body: body
                                                                                    });
                                                                                });
                                                                            } else {
                                                                                console.log('========================')
                                                                                console.log(`${value}.json complete`)
                                                                                console.log("Next file")
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
                                                }, 100);
                                            });
                                        } else {
                                            trackCallback();
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            });
        },
        recommend: function () {
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
