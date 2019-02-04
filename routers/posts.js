const spotify = require('../helpers/spotify_api.js');
const mongo = require('../helpers/mongo');

const trainer = require('../helpers/frontTraining');
const recommender = require('../helpers/musicTool/helpers/recommend');

const neo = require('../helpers/musicTool/helpers/neo4j');
const async = require('async');

const Axios = require('axios');
const config = require('../helpers/secretKeys');

const passportRefreshToken = require('passport-oauth2-refresh');


function grabNewToken (username, refresherToken, callback) {
    passportRefreshToken.requestNewAccessToken('spotify', refresherToken, {}, function (err, accessToken, refreshToken) {
        if (err) return console.log("Refresh Token error: ", err);
        let newRefreshToken = refreshToken == null ? refresherToken : refreshToken;

        console.log("New token: " + accessToken);
        spotify('setAccessToken', {username: username, access_token: accessToken});

        mongo('update', 'users', {identifier: {username: username}, data: {'spotify': {access_token: accessToken, refresh_token: newRefreshToken}}});
        callback();
    });
}


module.exports = function () {
    return {
        setRouting: function (router) {
            router.get('/currentSong', this.currentSong);
            router.get('/grabPlaylistGenre', this.grabPlaylistGenre);
            router.get('/grabActivePlaylist', this.grabActivePlaylist);
            router.get('/recommend', this.recommendingMusic);
            router.get('/initial', this.initialise);
            router.get('/managePlaylist', this.managePlaylist);

            router.post('/consentLearn', this.consentLearn);
            router.post('/refreshToken', this.refreshToken);
        },

        recommendingMusic: function(req, res) {
            let tmpGenres=[];
            let states = JSON.parse(req.query.genreStates);

            // Grabs a list of active genres selected by the user.
            for (let index in states) {
                if (states.hasOwnProperty(index)){
                    if (states[index]) {
                        tmpGenres.push(index);
                    }
                }
            }

            const url = "http://"+config.neo4j.ip + ':' + config.neo4j.port;
            Axios.get(url)
                .then(() => {
                    spotify('grabToken', {username: req.user.id}, token => {
                        recommender(token, {user: req.user, genres: tmpGenres, username: req.user.id, musicQuantity: req.query.musicQuantity, savePlaylist: req.query.savePlaylist}, resp => {
                            if (resp.successSongs.length) {

                                let newHistory = {
                                    time: new Date().getTime(),
                                    songs: resp.successSongs
                                };

                                mongo('grabOne', 'users', { identifier: {id: req.user.id } }, (resp) => {
                                    let tmp = [newHistory, ...resp.records.history];
                                    mongo('update', 'users', { identifier: { id: req.user.id }, data: { history: tmp.splice(0, config.table_settings.max_limit) } } );
                                    res.json({success: true, resp: resp});
                                });
                            } else {
                                console.log("Response: ", resp);
                                res.json({success: false, resp: resp});
                            }
                        });
                    });
                })
                .catch(function(err){
                    res.json({success: false, error: err, function: `Failed to connect to ${url}`});
                });
        },
        currentSong: function(req, res) {
            spotify("grabCurrentMusic", {username: req.query.username}, data => {
                res.json({
                    isPlaying: data.is_playing,
                    song: data.item.name,
                    artist: data.item.artists[0].name,
                    image: data.item.album.images[0].url
                });
            });
        },
        grabPlaylistGenre: function(req, res) {
            mongo('update', 'users', { identifier: { id: req.user.id }, data: { activePlaylists: req.query.playlists } } );
            mongo('grabOne', 'users', { identifier: {id: req.user.id } }, (resp) => {
                trainer("grabURI", req.user.id, resp.records.spotify.access_token, req.query.playlists, () => {
                    res.json({success: true});
                });
            });
        },
        grabActivePlaylist: function(req, res) {
            mongo('grabOne', 'users', { identifier: { id: req.user.id }, options: { activePlaylists: { $exists: true } } }, resp => {
                if (resp.records !== null) {
                    if (resp.records.activePlaylists !== null) {
                        res.json({
                            success: true,
                            playlists: resp.records.activePlaylists
                        });
                    }
                } else {
                    res.json({success: false});
                }
            });
        },
        initialise: function (req, res) {
            spotify('new_user', {username: req.user.id}, () => {
                mongo('grabOne', 'users', {identifier: {id: req.user.id}}, resp => {
                    // Automatically refresh on load
                    grabNewToken(req.user.id, resp.records.spotify.refresh_token, () => {
                        spotify('grabPlaylists', {
                            username: req.user.id,
                            access_token: resp.records.spotify.access_token
                        }, playlists => {
                            console.log(resp)
                            if (playlists.success) {
                                res.json({
                                    success: true,
                                    userAccount: req.user,
                                    playlists: playlists.data,
                                    new_user: !resp.records.hasOwnProperty('playlist'),
                                    access_token: resp.records.spotify.access_token,
                                    privatePlaylist: resp.records.playlistOptions.is_private,
                                    playlistName: resp.records.playlistOptions.name,
                                    activePlaylists: resp.records.activePlaylists,
                                    history: resp.records.history || [],
                                });
                            } else {
                                console.log(req.user.id);
                                console.log(resp.records);
                                res.json({success: false});
                            }
                        });
                    });
                });
            });
        },
        refreshToken: function (req, res) {
            mongo('grabOne', 'users', {identifier: {username: req.user.id}}, resp => {
                grabNewToken(req.user.id, resp.records.spotify.refresh_token, function () {
                    res.redirect('/');
                });
            });
        },
        consentLearn: function (req, res) {
            console.log("Recieved...")
            let failedSongs = req.query.songs;
            console.log(failedSongs)
            async.eachOfSeries(failedSongs, function (song, songKey, songCallback) {
                console.log(">>", song)

                song = JSON.parse(song);

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

                        if (songKey+1 >= failedSongs.length) {
                            res.json({success: true});
                        } else {
                            songCallback();
                        }
                    });
                });
            })
        },
        managePlaylist: function (req, res) {
            console.log("Managing playlist")
            let task = req.query.task;

            mongo('grabOne', 'users', { identifier: { id: req.user.id }, options: { playlistOptions: { $exists: true } } }, resp => {
                //console.log(resp)
                if (resp.records.playlistOptions.is_active) {
                    switch(task){
                        case 'clear':
                            console.log("Preparing to delete")
                            spotify("clearPlaylist", {username: req.user.id, playlistOptions: resp.records.playlistOptions}, data => {
                                console.log("Deleted")
                                res.json(data);
                            });
                            break;
                        case 'change_option':
                            spotify("changePlaylistInformation", {username: req.user.id, new_changes: req.query.data, playlistOptions: resp.records.playlistOptions}, data => {
                                if(data.success){
                                    let newPlaylistOptions = resp.records.playlistOptions;
                                    newPlaylistOptions.name = data.new_name;
                                    newPlaylistOptions.is_private = data.is_private;
                                    mongo('update', 'users', { identifier: { id: req.user.id }, data: { playlistOptions: req.query.playlists } } );
                                    console.log("Changed")
                                    res.json(data);
                                }
                            });
                            break;
                        case 'delete':
                            try {
                                console.log("Preparing to delete playlist")
                                console.log(resp.records)
                                spotify("deletePlaylist", {username: req.user.id, playlistOptions: resp.records.playlistOptions}, data => {
                                    if(data.success){
                                        let newPlaylistOptions = resp.records.playlistOptions;
                                        newPlaylistOptions.name = '';
                                        newPlaylistOptions.id = '';
                                        newPlaylistOptions.is_private = true;
                                        newPlaylistOptions.is_active = false;
                                        mongo('update', 'users', { identifier: { id: req.user.id }, data: { playlistOptions: req.query.playlists } } );
                                        console.log("Delete playlist")
                                        res.json(data);
                                    }
                                });
                                break;
                            } catch(e) {
                                console.log(e)
                            }
                    }
                } else {
                    res.json({success: false, error: 'No playlist found...', function: 'Trying to change playlist settings'});
                }
            });
        }
    };
};
