const keys = require('./secretKeys.js');
const client_id = keys.spotify.client_id;
const client_secret = keys.spotify.client_secret;
const redirect_uri = keys.spotify.spotify_callback;

const async = require('async');
const eachOf = require('async/eachOf');
const timeout = require('async/timeout');

const maxTime = 200;
const DataCollection = process.argv[3];

// TrackData

const MongoClient = require('mongodb').MongoClient;

const SpotifyWebApi = require('spotify-web-api-node');
// Collecting the access token.

let timer = maxTime; // Starter
let countDown = 0;

const Spotify = require('machinepack-spotify');
let spotifyApi = new SpotifyWebApi({
    clientId : client_id,
    clientSecret : client_secret,
    redirectUri : redirect_uri
});

let filesToSort = [];

let countSongs = 0;


let text = "", db;

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
            console.log("ACCESS TOKEN SENT")
            callback();
        }
    });
}

function analyseError(error, callback){
    let errorMessage;

    if(error.message){
        switch(error.message){
            case 'Unauthorized':
                setUpAccount(function(){
                    callback();
                });
                break;
        }
    }
    callback();
}

function grabFeatures(trackURI, featureCallback){
    setTimeout(function(){
        trackURI = trackURI.split(':');
        trackURI = trackURI[trackURI.length -1];
        spotifyApi.getAudioFeaturesForTrack(trackURI)
        .then(function(data){
            featureCallback(data);
        }).catch(function(err) {
            console.log("FEATURE ERROR: " + err);
            analyseError(err, function(){
                featureCallback({err: "Skipping"});
            });
        });
    }, timer);
    timer += maxTime;
}

function grabArtist(uri, artistCallback){
    uri = uri.split(':');
    uri = uri[uri.length -1];
    spotifyApi.getArtist(uri)
    .then(function(data){
        artistCallback(data);
    }).catch(function(err) {
        console.log("ARTIST ERROR: " + err);
        analyseError(err, function(){
            artistCallback({err: "Skipping"});
        });
    });
}

let updateDB = function(id, track, callback){
        db.collection(DataCollection).insert({"_id": id, trackInfo: track})
        .then(function(){
            callback();
        })
        .catch(function (err){
            console.log("UPDATE DATABASE ERROR: " + err)
        });
}

let checkIfExistDB = function(id, callback){
    db.collection(DataCollection).find({_id:id}).toArray(function(err, results){
        if(err) console.log("EXISTING Database: " + err);

        if(results.length){
            callback(true);
        } else {
            callback(false);
        }
    });
}

function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + " hour(s) and " + rminutes + " minute(s).";
}

function LoopThrough(jsonData){
    setUpAccount(function(){
        let tracks = jsonData.playlists;

        async.forEachOf(tracks, function (value, keyPlaylist, callbackPlaylist) {
            let tracksParent = tracks[keyPlaylist].tracks;

            async.forEachOf(tracksParent, function (value, key, callbackTrack) {
                let trackData = {};

                let element = tracksParent[key];
                let trackURI = element.track_uri.split(':');
                trackURI = trackURI[trackURI.length - 1];

                checkIfExistDB(trackURI, function(exists){
                    if(!exists){
                        grabFeatures(element.track_uri, function(data){

                            trackData = Object.assign({}, trackData, data.body);
                            grabArtist(element.artist_uri, function(data){
                                trackData = Object.assign({}, trackData, {genres: data.body.genres});
                                updateDB(trackURI, trackData, function(){
                                    console.log(trackData)
                                    countDown += 100;


                                    console.log("===================================================================");
                                    console.log("Estimated time: " + timeConvert((((timer - countDown) / 1000)/60).toFixed(2)) + " / " + (100 - (((timer - countDown) / timer) * 100)).toFixed(2) + "%");
                                    console.log("===================================================================");

                                    callbackTrack();
                                });
                            });
                        });
                    } else {
                        console.log(trackURI + " has already been added!>>");
                    }
                });

                countSongs ++;
                console.log("LOADING - PLEASE WAIT - Current total songs: " + countSongs);
            }, function (err) {
                if (err) console.error("Track Loop error: "+err.message);
            });

        }, function (err) {
            if (err) console.error("Playlist Loop error: "+err.message);
        });




        /*for(var playlistIndex=0; playlistIndex < tracks.length; playlistIndex ++){

            let tracksParent = tracks[playlistIndex].tracks;
            tracksParent.forEach(function(element, index){
                let trackData = element;
                let trackURI = element.track_uri.split(':');
                trackURI = trackURI[trackURI.length - 1];
                checkIfExistDB(trackURI, function(exists){
                    if(!exists){
                        setTimeout(function(){

                            grabFeatures(element.track_uri, function(data){
                                if(data.err){

                                    console.log(data.err)
                                } else {
                                    trackData = Object.assign({}, trackData, data.body);
                                    grabArtist(element.artist_uri, function(data){
                                        if(!data.err){
                                            console.log(data.err)
                                        } else {
                                            trackData = Object.assign({}, trackData, {genres: data.body.genres});
                                            updateDB(trackURI, trackData);
                                            console.log(trackData)
                                            countDown += 100;
                                            console.log("===================================================================");
                                            console.log("Estimated time: " + timeConvert((((timer - countDown) / 1000)/60).toFixed(2)) + " / " + (100 - (((timer - countDown) / timer) * 100)).toFixed(2) + "%");
                                            console.log("===================================================================");
                                        }
                                    });
                                }
                            });

                        }, timer);
                        timer += maxTime;
                    } else {
                        console.log("<<" + trackURI + " has already been added!>>");
                    }
                });
            });
        }*/
    });
}

function readTextFile(fileText){
    fs = require('fs')
    fs.readFile(fileText, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        LoopThrough(JSON.parse(data));
    });
}


//readTextFile("./Data/" + process.argv[2] + ".json");
MongoClient.connect("mongodb://localhost:27017/musicDEV", function(err, database) {
    if(err) return console.error(err);
    db = database;
    //db.collection('TestingDB').drop();
    console.log("connected to " + db.s.databaseName);
    filesToSort = process.argv[2].split("-");

    async.forEachOf(filesToSort, function (value, keyFiles, callbackFiles) {

        readTextFile("./Data/" + filesToSort[keyFiles] + ".json");

    });
});
