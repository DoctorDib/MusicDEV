const keys = require('../secretKeys.json');
const client_id = keys.spotify.client_id;
const client_secret = keys.spotify.client_secret;
const redirect_uri = keys.spotify.spotify_callback;

const async = require('async');
const eachOf = require('async/eachOf');
const timeout = require('async/timeout');
const _ = require('underscore')

const maxTime = 150;
const DataCollection = process.argv[3];

// TrackData

const MongoClient = require('mongodb').MongoClient;

const SpotifyWebApi = require('spotify-web-api-node');
// Collecting the access token.

let timer = maxTime; // Starter
let artistTimer = maxTime; // Starter
let clockTimer = timer;
let countDown = 0;

let currentSongList = 0;
let totalPlayLists = 0;


const Spotify = require('machinepack-spotify');
let spotifyApi = new SpotifyWebApi({
    clientId : client_id,
    clientSecret : client_secret,
    redirectUri : redirect_uri
});

let filesToSort = [];

let countSongs = 0;

let text = "", db;

function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + " hour(s) and " + rminutes + " minute(s).";
}

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

let updateDB = function(id, track, callback){
    currentSongList = currentSongList - 1;
    checkIfExistDB(id, function(data){
        if(!data){
            db.collection(DataCollection).insert({"_id": id, trackInfo: track})
            .then(function(){
                callback();
            })
            .catch(function (err){
                console.log("UPDATE DATABASE ERROR: " + err)
            });
        } else {
            console.log("EXISTING ERROR: ID ALREADY EXISTS - SKIPPING...")
            callback()
        }
    });
}

function grabArtist(uri, artistCallback){
    uri = uri.split(':');
    uri = uri[uri.length -1];
    spotifyApi.getArtist(uri)
    .then(function(data){
        artistCallback(data);
    }).catch(function(err) {
        console.log("ARTIST ERROR: " + err);
    });
}

function grabArtists(artistURIList, callback){
    var finalObject = {};
    artistURIList = _.uniq(artistURIList);
    artistURIList = _.chunk(artistURIList, 50); // Splitting array into chunks of 50

    async.eachOfSeries(artistURIList, function (value, chunkKey, artistChunkLoopCallback) {

        spotifyApi.getArtists(artistURIList[chunkKey])
          .then(function(data) {
              async.eachOfSeries(data.body.artists, function (value, key, artistLoopCallback) {
                  var artistId = data.body.artists[key].id;
                  finalObject[artistId] = data.body.artists[key]

                  if(key === data.body.artists.length - 1){
                      if(chunkKey === artistURIList.length - 1){
                          callback(finalObject);
                      } else {
                          artistChunkLoopCallback();
                      }
                  } else {
                      artistLoopCallback();
                  }
              });
          }, function(err) {
              console.log(artistURIList)
            console.error("ARTIST ERROR: " + err);
          });
    });
}

function grabTracks(trackURIList, callback){
    var finalTrackObject = {};
    trackURIList = _.uniq(trackURIList);
    trackURIList = _.chunk(trackURIList, 50); // Splitting array into chunks of 50

    async.eachOfSeries(trackURIList, function (value, trackKey, trackChunkLoopCallback) {

        spotifyApi.getAudioFeaturesForTracks(trackURIList[trackKey])
        .then(function(data) {
            async.eachOfSeries(data.body.audio_features, function (value, key, trackLoopCallback) {

                if(data.body.audio_features[key]){
                    if(data.body.audio_features[key].id){
                        var trackId = data.body.audio_features[key].id;
                        finalTrackObject[trackId] = data.body.audio_features[key];
                    }
                }

                if(key === data.body.audio_features.length - 1){
                    if(trackKey === trackURIList.length - 1){
                        callback(finalTrackObject);
                    } else {
                        trackChunkLoopCallback();
                    }

                } else {
                    trackLoopCallback();
                }
            });
        }, function(err) {
            console.log(trackURIList)
            console.log("PLAYLIST TRACKS ERROR: " + err);
        });
    });
}

function mergeAndSave(tracks, trackObject, artistObject, mergeCallback) {
    async.eachOfSeries(tracks, function (value, key, mergeLoopCallback) {
        let currentTrack = tracks[key];

        let trackUri = currentTrack.track_uri.split(':');
        trackUri = trackUri[trackUri.length - 1];

        let artistUri = currentTrack.artist_uri.split(':');
        artistUri = artistUri[artistUri.length - 1];

        let finalTrack = Object.assign(currentTrack, trackObject[trackUri]);
        //console.log(artistObject[artistUri].genres)
        console.log(artistUri)
        if(artistObject[artistUri]){
            if(!artistObject[artistUri].genres){
                console.log("WHAT?")
            } else {
                finalTrack.genres = artistObject[artistUri].genres;
            }
        }

        //finalTrack.genres = artistObject[artistUri].genres;


        updateDB(finalTrack.id, finalTrack, function(){
            console.log("compelte")

            if(key === tracks.length - 1){
                mergeCallback();
            } else {
                mergeLoopCallback();
            }
        });
    });
}

function loopPlaylistTrack(playlist, masterCallback){
    var tracks = [], trackURIList = [], artistURIList = [];
    playlist = playlist.tracks;



    async.eachOfSeries(playlist, function (value, key, trackLoopCallback) {

        //setTimeout(function(){
        if(playlist[key]){
            var trackUri = playlist[key].track_uri.split(':');
            trackUri = trackUri[trackUri.length - 1];

            var artistUri = playlist[key].artist_uri.split(':');
            artistUri = artistUri[artistUri.length - 1];

            tracks.push(playlist[key]);
            trackURIList.push(trackUri);
            artistURIList.push(artistUri);

            trackLoopCallback();

            if(key === playlist.length - 1){

                setTimeout(function(){
                    //console.log(tracks)
                    grabTracks(trackURIList, function(trackObject){
                        grabArtists(artistURIList, function(artistObject){
                            mergeAndSave(tracks, trackObject, artistObject, function(){
                                masterCallback();
                            });
                        });
                    });
                }, maxTime);
            }
        }
    });
}

function beginLoop(playlistData, masterCallback){
    setUpAccount(function(){
        async.eachOfSeries(playlistData, function (value, key, playlistLoopCallback) {
            if(playlistData[key]){
                loopPlaylistTrack(playlistData[key], function(){
                    if(key === (playlistData.length - 1)){
                        masterCallback();
                    } else {
                        playlistLoopCallback();
                    }
                });
            }
        });
    });
}

function readTextFile(fileText, textCallback){
    fs = require('fs')
    fs.readFile(fileText, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }

        beginLoop(JSON.parse(data).playlists, function(){
            textCallback();
        });
    });
}

MongoClient.connect("mongodb://localhost:27017/musicDEV", function(err, database) {
    if(err) return console.error(err);
    db = database;
    //db.collection('TestingDB').drop();
    console.log("connected to " + db.s.databaseName);
    filesToSort = process.argv[2].split("-");

    async.eachOfSeries(filesToSort, function (value, keyFiles, callbackFiles) {

        readTextFile("./Data/" + filesToSort[keyFiles] + ".json", function(){
            console.log("*******************************************")
            console.log(filesToSort[keyFiles] + " complete");
            console.log("*******************************************")
            callbackFiles();
        });
    });
});


/*async.eachOfSeries(playlistData, function (value, key, trackLoopCallback) {
    if(playlist[key]){

    } else {
        // Compelte and callback
        masterCallback();
    }
});*/

/*artistTimer = 100;
async.eachOfSeries(trackFeatures, function (value, key, mergeLoopCallback) {
    let currentTrack = trackFeatures[key];
    if(currentTrack){
        let finalTrack = Object.assign(tracks[currentTrack.id], currentTrack);

        //setTimeout(function(){



            grabArtist(finalTrack.artist_uri, function(data){
                finalTrack.genres = data.body.genres;
                updateDB(finalTrack.id, finalTrack, function(){
                    console.log("ADDED: ", finalTrack);
                    console.log("===================================================================");
                    console.log("Songs left: " + currentSongList);
                    console.log("===================================================================");
                    mergeLoopCallback();
                });
            });
        //}, maxTime);
    }

    if(key === (trackFeatures.length - 1)){
        //setTimeout(function(){
            masterMergeCallback();
        //}, artistTimer);
    }

    artistTimer += (maxTime);
    //clockTimer += artistTimer;
});*/
