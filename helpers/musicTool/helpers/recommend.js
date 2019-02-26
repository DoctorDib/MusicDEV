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

function blacklistTrack() {

}

module.exports = function (spotifyApi, data, callback) {
    MongoClient.connect(`mongodb://localhost:${config.mongo_settings.port}/${config.mongo_settings.name}`, function (err, database) {
        const db = database.db(config.mongo_settings.name);
        if (err) return callback({success: false, error: err});

        let userCollection = db.collection("users");
        let finalReturn = [], errorReturn = [];

        console.log("Start")

        db.collection("blacklist").findOne({blacklist: {$exists: true}}, blacklistData => {

            let newBlackList = blacklistData || {};

            async.eachOfSeries(data.genres, function (genre, genreKey, genreCallback) {
                let genreCollection = data.listenFunction ? data.genres : config.recommendation_config.activitiesMap[genre] ;
                let indexSelections = {};

                userCollection.aggregate(
                    [
                        { '$match': {"id": data.username} },
                        { '$unwind': '$playlist'},
                        { '$match': {'playlist.genre': { $in: genreCollection }}}
                    ]
                ).toArray(function(err, docs) {
                    if (err) console.log(err)
                    console.log(docs);
                    console.log("Results: ", docs[0].playlist)

                    let userPlaylist = [], userFeatureList = [], warningFlag=false;
                    for (let index in docs) {
                        if (docs.hasOwnProperty(index)) {
                            userPlaylist.push(docs[index].playlist);
                            userFeatureList.push(docs[index].playlist.features);
                        }
                    }

                    let ewwArray = [];
                    for (let eww=0; eww<data.musicQuantity; eww++){
                        ewwArray.push(eww);
                    }

                    async.eachOfSeries(ewwArray, function (quantity, quantityKey, quantityCallback) {
                        let random = Math.floor(Math.random() * userPlaylist.length);
                        if (indexSelections[random]){
                            // Song has already been selected
                            if (Object.keys(indexSelections).length >= userPlaylist.length) {
                                if (quantityKey+1 >= ewwArray.length){
                                    if (genreKey+1 >= data.genres.length ) {

                                        // Finished
                                        db.collection("blacklist").update({blacklist: {$exists: true}}, {$set: {"blacklist": newBlackList} }, {upsert: true});
                                        if (JSON.parse(data.savePlaylist) && finalReturn.length) {
                                            saveRecommendedMusic(data.username, finalReturn, () => {
                                                callback({success: !warningFlag, savePlaylist: data.savePlaylist, successSongs: finalReturn, failedSongs: errorReturn, songUsed: userPlaylist[random]});
                                            });
                                        } else {
                                            callback({success: !warningFlag, savePlaylist: data.savePlaylist, successSongs: finalReturn, failedSongs: errorReturn, songUsed: userPlaylist[random]});
                                        }
                                    } else {
                                        genreCallback()
                                    }
                                } else {
                                    quantityCallback();
                                }
                            } else {
                                // Not enough songs in user playlist to grab recommendations
                                if (quantityKey+1 >= ewwArray.length) {
                                    if (genreKey+1 >= data.genres.length ) {
                                        callback({
                                            success: !warningFlag,
                                            savePlaylist: data.savePlaylist,
                                            successSongs: finalReturn,
                                            failedSongs: errorReturn,
                                            error: `Please add more playlists to have ${ewwArray.length} songs.`
                                        });
                                    } else {
                                        genreCallback();
                                    }
                                } else {
                                    quantityCallback();
                                }
                            }
                        } else {
                            indexSelections[random] = true;
                            let selectedSong =  userPlaylist[random];

                            console.log(userPlaylist[random])
                            console.log("Started learning from:")

                            console.log(selectedSong);

                            neo('exists', {genre: userPlaylist[random].genre, id: selectedSong.id}, existsResp => { // TODO - FIND OUT IF THIS IS CORRECT
                                console.log(1)
                                if (existsResp.success) {
                                    if (existsResp.exist) {
                                        console.log(2)
                                        neo('recommend', {genre: userPlaylist[random].genre, song: selectedSong}, resp => {

                                            console.log(resp.data)

                                            let randomSelection = Math.floor(Math.random() * resp.data.length);
                                            console.log("===========")
                                            console.log(resp.data[randomSelection])
                                            console.log(randomSelection)
                                            finalReturn.push(resp.data[randomSelection].returnedNode.properties);
                                            if (quantityKey+1 >= ewwArray.length){
                                                console.log(4)
                                                if (genreKey+1 >= data.genres.length ) {
                                                    console.log(5)
                                                    // Finished
                                                    db.collection("blacklist").update({blacklist: {$exists: true}}, {$set: {"blacklist": newBlackList} }, {upsert: true});
                                                    if (JSON.parse(data.savePlaylist) && finalReturn.length) {
                                                        saveRecommendedMusic(data.username, finalReturn, () => {
                                                            console.log("Callback")
                                                            callback({success: !warningFlag, savePlaylist: data.savePlaylist, successSongs: finalReturn, failedSongs: errorReturn, songUsed: userPlaylist[random]});
                                                        });
                                                    } else {
                                                        console.log("failed?")
                                                        callback({success: !warningFlag, savePlaylist: data.savePlaylist, successSongs: finalReturn, failedSongs: errorReturn, songUsed: userPlaylist[random]});
                                                    }
                                                } else {
                                                    console.log(1)
                                                    genreCallback();
                                                }
                                            } else {
                                                console.log(2)
                                                console.log(">",ewwArray.length)
                                                console.log("<",quantityKey+1)
                                                quantityCallback();
                                            }
                                        });
                                    } else {
                                        console.log(6)
                                        warningFlag = true; // There is at least one error existing
                                        console.log("HERE")
                                        selectedSong.success = false;
                                        errorReturn.push(selectedSong);
                                        newBlackList[selectedSong.id] = newBlackList[selectedSong.id] || selectedSong;
                                        if (quantityKey+1 >= ewwArray.length){
                                            if (genreKey+1 >= data.genres.length ) {
                                                // Finished
                                                db.collection("blacklist").update({blacklist: {$exists: true}}, {$set: {"blacklist": newBlackList} }, {upsert: true});
                                                callback({success: !warningFlag, successSongs: finalReturn, failedSongs: errorReturn, songUsed: userPlaylist[random]})
                                            } else {
                                                genreCallback()
                                            }
                                        } else {
                                            quantityCallback();
                                        }
                                    }
                                } else {
                                    callback({success: false, error: respResp.error})
                                }
                            });
                        }
                    });
                });
            });
        });
    });
};
