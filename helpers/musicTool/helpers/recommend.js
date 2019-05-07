const MongoClient = require('mongodb').MongoClient;
const config = require('../../../config/config');
const mongo = require('../../mongo');
const neo = require('./neo4j');

const async = require('async');

const spotifyHelper = require('../../spotifyApi');

function addSongs (username, playlistOptions, music, callback) {
    spotifyHelper('saveToPlaylist', {username: username, playlistOptions: playlistOptions, music: music}, (resp) => {
        callback()
    });
}

// Ensuring duplicates will not be added
function checkMultiples (username, playlistOptions, music, callback) {
    let final = [];

    for (let index in music) {
        if (music.hasOwnProperty(index)) {
            let found = false;
            for (let playlistIndex in playlistOptions.savedTracks) {
                if (playlistOptions.savedTracks.hasOwnProperty(playlistIndex)) {
                    if(music[index].id === playlistOptions.savedTracks[playlistIndex].id) {
                        found = true;
                    }
                }
            }

            if (!found) {
                final.push(music[index]);
                found = false;
            }
        }
    }

    if (final.length) {
        addSongs(username, playlistOptions, final, () => {
            callback(final);
        });
    } else {
        callback(final);
    }
}

function saveRecommendedMusic (username, music, callback) {
    mongo('grabOne', 'users', {identifier: {id: username}}, (data) => {
        console.log("Saving")
        // Checking if there is already a musicDEV playlist
        if (JSON.parse(data.records.playlistOptions.is_active)) {

            checkMultiples(username, data.records.playlistOptions, music, (savedTracks) => {

                let tracks = data.records.playlistOptions.savedTracks;
                console.log(tracks)
                tracks = [...savedTracks, ...tracks];

                mongo('update', 'users', {identifier: {id:username}, data: {'playlistOptions.savedTracks': tracks} } );

                callback();
            });
        } else {
            // Create playlist
            spotifyHelper('createPlaylist', {username: username, playlistOptions: data.records.playlistOptions}, (resp) => {
                if (JSON.parse(resp.success)) {
                    let newPlaylistOptions = data.records.playlistOptions;
                    newPlaylistOptions.is_active = true;
                    newPlaylistOptions.id = resp.data.body.id;
                    newPlaylistOptions.savNedTracks = music;

                    mongo('update', 'users', {identifier: {id: username}, data: {playlistOptions: newPlaylistOptions}});
                    console.log("Saved new playlist")
                    addSongs(username, newPlaylistOptions, music, () => {
                        callback();
                    });
                }
            });
        }
    });
}

module.exports = function (spotifyApi, data, callback) {
    MongoClient.connect(`mongodb://localhost:${config.mongo_settings.port}/${config.mongo_settings.name}`, function (err, database) {
        const db = database.db(config.mongo_settings.name);
        if (err) return callback({success: false, error: err});

        let userCollection = db.collection("users");
        let finalReturn = [], errorReturn = [];

        console.log("Start")

        db.collection("blacklist").findOne({blacklist: {$exists: true}}, (err, blacklistRecords) => {
            if (err) console.log(err);

            let newBlackList = blacklistRecords !== null && blacklistRecords.hasOwnProperty("blacklist") ? blacklistRecords.blacklist : {};

            async.eachOfSeries(data.genres, function (genre, genreKey, genreCallback) {
                let genreCollection = data.listenFunction ? data.genres : config.recommendation_config.activitiesMap[genre] ;
                let indexSelections = {};

                console.log(genreCollection)
                console.log(data.username)

                userCollection.aggregate(
                    [
                        { '$match': {"id": data.username} },
                        { '$unwind': '$playlist'},
                        { '$match': {'playlist.genre': { $in: genreCollection } } },
                    ]
                ).toArray((err, docs) => {
                    if (err) console.log(err);
                    console.log(docs)

                    let userPlaylist = [], userFeatureList = [], warningFlag=false;
                    for (let index in docs) {
                        if (docs.hasOwnProperty(index)) {
                            userPlaylist.push(docs[index].playlist);
                            userFeatureList.push(docs[index].playlist.features);
                        }
                    }

                    let ewwArray = [];
                    for (let eww=0; eww<data.musicQuantity; eww++) {
                        ewwArray.push(eww);
                    }

                    async.eachOfSeries(ewwArray, function (quantity, quantityKey, quantityCallback) {

                        function returnData(random) {
                            callback({ success: !warningFlag, savePlaylist: data.savePlaylist, successSongs: finalReturn, failedSongs: errorReturn, songUsed: userPlaylist[random] });
                        }

                        function finishCheck(random) {
                            if (quantityKey+1 >= ewwArray.length){
                                if (genreKey+1 >= data.genres.length ) {
                                    // Finished
                                    db.collection("blacklist").update({blacklist: {$exists: true}}, {$set: {"blacklist": newBlackList} }, {upsert: true});
                                    if (JSON.parse(data.savePlaylist) && finalReturn.length) {
                                        saveRecommendedMusic(data.username, finalReturn, () => {
                                            returnData(random);
                                        });
                                    } else {
                                        returnData(random);
                                    }
                                } else {
                                    genreCallback();
                                }
                            } else {
                                quantityCallback();
                            }
                        }

                        // No songs within the users playlist that matches
                        if (!userPlaylist.length) {
                            console.log("Ping")
                            process.exit(1)
                        } else {
                            let random = userPlaylist.length ? Math.floor(Math.random() * userPlaylist.length) : 0; // TODO - FIND OUT WHY QUANTITY SOMETIMES DOES NOT WORK...
                            let selectedSong =  userPlaylist[random];

                            console.log(selectedSong)

                            if (selectedSong && indexSelections[random] || newBlackList.hasOwnProperty(selectedSong.id)){
                                // Song has already been selected or song is in the black list...
                                finishCheck(random);
                            } else {
                                indexSelections[random] = true;

                                neo('exists', {genre: userPlaylist[random].genre, id: selectedSong.id}, existsResp => { // TODO - FIND OUT IF THIS IS CORRECT
                                    if (existsResp.success) {
                                        if (existsResp.exist) {
                                            neo('recommend', {genre: userPlaylist[random].genre, song: selectedSong}, resp => {
                                                if (resp.data) {
                                                    let randomSelection = Math.floor(Math.random() * resp.data.length);
                                                    finalReturn.push(resp.data[randomSelection].returnedNode.properties);
                                                }

                                                finishCheck(random);
                                            });
                                        } else {
                                            warningFlag = true; // There is at least one error existing
                                            selectedSong.success = false;
                                            errorReturn.push(selectedSong);
                                            newBlackList[selectedSong.id] = newBlackList[selectedSong.id] || selectedSong;

                                            neo('randomSong',  {genre: userPlaylist[random].genre}, randomSong=>{
                                                if(randomSong){
                                                    let randomSelection = Math.floor(Math.random() * randomSong.data.length);
                                                    finalReturn.push(randomSong.data[randomSelection].a.properties);
                                                }

                                                finishCheck(random);
                                            });
                                        }
                                    } else {
                                        callback({success: false, error: existsResp.error})
                                    }
                                });
                            }
                        }
                    });
                });
            });
        });
    });
};
