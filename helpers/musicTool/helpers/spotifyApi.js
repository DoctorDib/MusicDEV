const featureManager= require('./trackFeatureManager');
const async = require('async');

let timer = 100, coolDown = 0;

let self = {
    grabSingleFeature: function(spotifyApi, uri, callback){
        spotifyApi.getAudioFeaturesForTrack(uri)
            .then(function(resp) {
                let value = resp.body;
                callback(featureManager(value, true));
            }).catch(function(err){
            console.log("SINGLE TRACKS ERROR: " + err);
        });
    },
    grabFeatures: function(spotifyApi, type, trackURIList, callback) {
        let tmpMemory = [];
        spotifyApi.getAudioFeaturesForTracks([trackURIList])
            .then(function(data) {
                async.eachOfSeries(data.body.audio_features, function (value, key, trackLoopCallback) {
                    if(!value){
                        if(key+1 >= data.body.audio_features.length){
                            callback(tmpMemory);
                        } else {
                            trackLoopCallback();
                        }
                    } else {
                        let features = featureManager(value, true);

                        if (type) {
                            // Formatting for the Nerual networking process
                            features = {
                                input: features,
                                output: {
                                    [type]: 1
                                }
                            }
                        } else {
                            features.id = value.id;
                        }

                        tmpMemory.push({id: value.id, features: features});

                        if(key+1 >= data.body.audio_features.length){
                            callback(tmpMemory);
                        } else {
                            trackLoopCallback();
                        }
                    }
                });
            }, function(err) {
                //console.log(trackURIList)
                console.log("PLAYLIST TRACKS ERROR: " + err);
            });
    },

    grabPlaylists: function(spotifyApi, type, URI, callback){
        spotifyApi.getPlaylist(URI)
            .then(function(data) {
                let trackURIList = [];
                let memory = [];

                async.eachOfSeries(data.body.tracks.items, function (value, chunkKey, playlistCallback) {

                    //console.log(data.body.tracks.items)
                    if((chunkKey+1) !== data.body.tracks.items.length && trackURIList.length < 50){
                        if(value.track !== null){
                            trackURIList.push(value.track.id);
                        }
                        playlistCallback();
                    } else {
                        timer += coolDown;
                        setTimeout(() => {
                            self.grabFeatures(spotifyApi, type, trackURIList, function(resp){
                                memory = [...memory, ...resp];

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
                    console.log(err)
                    process.exit(1);
                }
                console.log("Something went wrong!", err);
            });
    }
};

module.exports = self;