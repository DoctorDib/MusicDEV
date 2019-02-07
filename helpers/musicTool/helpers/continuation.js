const config = require('../../../config/config');
const spotify = require('../../spotify_api');
const mongo = require('../../mongo');
const predict = require('./predict');
const recommend = require('./recommend');
const neo = require('./neo4j');

const slugify = require('slugify');
const brain = require('brain.js');

module.exports = function (username, currentSong, callback) {

    mongo('grabOne', 'users', {identifier: { id: username }}, user => {
        let uri = currentSong.uri.split(':');
        uri=uri[uri.length-1];
        console.log(uri)
        console.log(user.records)
        spotify('grabFeaturesFromTracks', {username: username, access_token: user.records.spotify.access_token, trackURIs:[uri]}, resp => {
            console.log(resp[0])

            mongo('grabOne', 'musicMemory', {identifier: {id: 'memory'}}, netter => {

                let net = new brain.NeuralNetwork(config.classification_config.predict);
                net.fromJSON(netter.records.memory);

                predict(net, resp[0].features, genre => {
                    console.log(genre)
                    genre = slugify(genre);

                    spotify('grabToken', {username: username}, spotifyApi => {
                        recommend(spotifyApi, {genres: [genre], listenFunction: true, username: username, musicQuantity: 1, savePlaylist: true}, recommended => {
                            if (recommended.success) {
                                callback({success: true, song: recommended.successSongs});
                            } else {
                                // Failed songs
                                let song = recommended.failedSongs[0];

                                let newSonger = song;
                                newSonger.features.features = newSonger.features.features || {};
                                newSonger.features.features = newSonger.features;

                                neo('create', {
                                    params: song,
                                    single: true
                                }, function (resp) {
                                    if (!resp.success) return console.log(resp.error);
                                    console.log("Created")

                                    console.log(song.genre)
                                    neo('masterLearn', {genre: song.genre}, function (resper) {
                                        console.log("Learnt")
                                        console.log(resper)
                                    });
                                });

                                console.log(recommended.songUsed)

                                let songLayout = { // Converting to readable state
                                    loudness: recommended.songUsed.features.loudness,
                                    liveness: recommended.songUsed.features.liveness,
                                    tempo: recommended.songUsed.features.tempo,
                                    valence: recommended.songUsed.features.valence,
                                    instrumentalness: recommended.songUsed.features.instrumentalness,
                                    danceability: recommended.songUsed.features.danceability,
                                    speechiness: recommended.songUsed.features.speechiness,
                                    acousticness: recommended.songUsed.features.acousticness,
                                    genre: recommended.songUsed.genre,
                                    name: recommended.songUsed.name,
                                    id: recommended.songUsed.id,
                                    key: recommended.songUsed.features.key,
                                    energy: recommended.songUsed.features.energy,
                                };

                                spotify('saveToPlaylist', {username: username, playlistOptions: user.records.playlistOptions, music: [songLayout]}, (resp) => {
                                    callback({success: true, message: 'New song learnt', song: [songLayout]});
                                });
                            }
                            console.log("I recommend: ")
                            console.log(recommended)
                        });
                    });

                });
            });
        });
    });
};