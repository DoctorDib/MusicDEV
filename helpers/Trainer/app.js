const dictionary =  require('./Data/dictionary');
//const dictionary =  require('./Data/playlistSmall');
const trackDictionary =  require('./Data/trackDictionary');
const config = require('./config/config');

// ==== Training models ==== \\
const trainer = require('./helpers/train');
//const trainer = require('./helpers/train-tree');
//const trainer = require('./helpers/train-synaptic');

const spotify = require('./helpers/spotifyApi');
const sample = require('./helpers/sample');

const secretKeys = require('../secretKeys.json');
const client_id = secretKeys.spotify.client_id;
const client_secret = secretKeys.spotify.client_secret;
const redirect_uri = secretKeys.spotify.spotify_callback;

const async = require('async');
const brain = require('brain.js');
const SpotifyWebApi = require('spotify-web-api-node');
const MongoClient = require('mongodb').MongoClient;

const Spotify = require('machinepack-spotify');
const spotifyApi = new SpotifyWebApi({
    clientId : client_id,
    clientSecret : client_secret,
    redirectUri : redirect_uri
});

const genreAndActivity = {
    genre: ['Pop', 'HipHop', 'RnB', 'Rock', 'Jazz'],
    activity: ['Workout', 'Chill', 'ElectronicAndDance', 'Party', 'Focus', 'Sleep', 'Romance', 'Gaming', 'Dinner', 'Travel']
};

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

MongoClient.connect("mongodb://localhost:27017/musicDEV", function(err, database) {
    if(err) return console.error(err);

    const db = database.db("musicDEV");

    let memory = { activity: {}, genre: {} };

    setUpAccount(function(){
        console.log("=========================================================================================");
        let useCollection;
        let saveCollection;

        if (process.argv[2] === "learn") {
            // Grabbing categories and then saving to - musicCats
            saveCollection = db.collection("musicCats");

            let limit, type;

            limit = process.argv[3] ? Number(process.argv[3]) : false;

            async.eachOfSeries(dictionary, function (dictionaryValue, mainKey, dictionaryCallback) {

                let catType = genreAndActivity.activity.indexOf(type) === -1 ? "genre" : "activity";

                async.eachOfSeries(dictionaryValue.uriList, function (uriValue, uriKey, uriCallback) {
                    spotify.grabPlaylists(spotifyApi, dictionaryValue.category, uriValue, (data) => {
                        type = dictionaryValue.category;

                        if(!memory[catType][type]){
                            memory[catType][type] = []
                        }
                        memory[catType][type] = [...memory[catType][type], ...data];
                        memory[catType][type] = memory[catType][type].splice(0, limit);

                        if(uriKey+1 >= dictionaryValue.uriList.length){
                            if((mainKey+1) !== dictionary.length ){
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
                                        saveCollection.drop(function(err, delOK) {
                                            if(err) return console.log("ERRRRROR")
                                            console.log("Replacing existing record")
                                            saveCollection.insert({id: "musicCats", "musicCats": memory});
                                        });
                                    }
                                });
                            }
                        } else {
                            console.log("==========================================================================");
                            console.log(type + ' - ' + (uriKey+1) + '/' + dictionaryValue.uriList.length);
                            console.log("TOTAL: " + ' - ' + (mainKey+1) + '/' + dictionary.length);
                            console.log("==========================================================================");


                            if(limit && memory[catType][type].length >= limit){
                                if(mainKey+1 === dictionary.length){
                                    saveCollection.findOne({"id": 'musicCats'}, function(err, respData) {
                                        if(respData === null){
                                            // Insert new record
                                            console.log("Inserting new record to Database")
                                            saveCollection.insert({id: "musicCats", "musicCats": memory});
                                        } else {
                                            // Replace with existing one.
                                            console.log("Existing record found...")
                                            saveCollection.drop(function(err, delOK) {
                                                if(err) return console.log("ERRRRROR")
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
        } else if (process.argv[2] === "learnTracks") {
            // Grabbing categories and then saving to - musicCats
            saveCollection = db.collection("musicCats");

            async.eachOfSeries(trackDictionary, function (dictionaryValue, mainKey, dictionaryCallback) {
                async.eachOfSeries(dictionaryValue.uriList, function (uriValue, uriKey, uriCallback) {

                    spotify.grabFeatures(spotifyApi, dictionaryValue.category, uriValue, function(data){
                        if (genreAndActivity.genre.indexOf(dictionaryValue.category) === -1){
                            if(!memory.activity[dictionaryValue.category]){
                                memory.activity[dictionaryValue.category] = []
                            }
                            memory.activity[dictionaryValue.category] = [...memory.activity[dictionaryValue.category], ...data]
                        } else {
                            if(!memory.genre[dictionaryValue.category]){
                                memory.genre[dictionaryValue.category] = []
                            }
                            memory.genre[dictionaryValue.category] = [...memory.genre[dictionaryValue.category], ...data]
                        }

                        if(uriKey+1 >= dictionaryValue.uriList.length){
                            if((mainKey+1) !== trackDictionary.length){

                                dictionaryCallback();
                            } else {
                                console.log("Here")
                                saveCollection.findOne({"id": 'musicCats'}, function(err, respData) {
                                    if(respData === null){
                                        // Insert new record
                                        console.log("Inserting new record to Database")
                                        saveCollection.insert({id: "musicCats", "musicCats": memory});
                                    } else {
                                        // Replace with existing one.
                                        console.log("Existing record found...")
                                        saveCollection.drop(function(err, delOK) {
                                            if (err) return console.log("ERRRRROR")
                                            console.log("Replacing existing record")
                                            saveCollection.insert({id: "musicCats", "musicCats": memory});
                                        });
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
                        let limit = process.argv[3] || false;
                        trainer(spotifyApi, data.musicCats, limit, (resp) => {
                            console.log("Returned")
                            saveCollection.findOne({"id": 'memory'}, function(err, respData) {
                                console.log("Searching")
                                if(respData === null){
                                    // Saving a new record
                                    console.log("Saving as new record")
                                    saveCollection.insert({id: "memory", "memory": resp});
                                } else {
                                    // Saving to existing record
                                    saveCollection.drop(function(err, delOK) {
                                        if (err) return console.log("ERRRRROR");
                                        console.log("Replacing with existing record")
                                        saveCollection.insert({id: "memory", "memory": resp})
                                    });
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
                    let net = new brain.NeuralNetwork(config.predict);
                    net.fromJSON(resp.memory[selected]);

                    let uri = process.argv[3].split(':');
                    uri = uri[uri.length - 1];

                    spotify.grabSingleFeature(spotifyApi, uri, function(data){
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
        } else if (process.argv[2] === "sample") {
            let useCollectionMemory = db.collection("musicMemory");
            let useCollectionCats = db.collection("musicCats");
            useCollectionMemory.findOne({"id": 'memory'}, function(err, resp) {
                if(!resp || resp === null){
                    console.log("Memory not found... Please teach me...");
                    process.exit(1);
                } else {
                    useCollectionCats.findOne({}, (err, cats) => {
                        if(!cats || cats === null){
                            console.log("Cats not found... please teach me");
                            process.exit(1);
                        } else {
                            sample(spotifyApi, resp, cats.musicCats)
                        }
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