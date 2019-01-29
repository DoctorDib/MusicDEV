const keys = require('./secretKeys.json');
const client_id = keys.spotify.client_id;
const client_secret = keys.spotify.client_secret;
const redirect_uri = keys.spotify.spotify_callback;
const scope = 'user-read-private user-read-email user-library-read user-top-read user-read-playback-state';

const request = require('request');
const SpotifyWebApi = require('spotify-web-api-node');
const otherSpotify = require('./musicTool/helpers/spotifyApi')

let spotifyApi = {};

const querystring = require('querystring');
const mongoose = require('../helpers/mongoose');
const stateKey = 'spotify_auth_state';

let authOptions = {};


module.exports = function(command, data, callback) {
    switch(command){
        case 'analyseTrack':
            spotifyApi[data.username].getAudioFeatures(data.trackURI)
                .then(function(data) {
                    // Output items
                    callback(data.body.item);
                    console.log("Now Playing: ",data.body.item.name);
                }, function(err) {
                    console.log('Something went wrong!', err);
                });
            break;
        case 'grabTrackInfo':
            console.log(data.tracks.length)
            spotifyApi[data.username].setAccessToken(data.access_token);
            spotifyApi[data.username].getTracks(data.tracks)
                .then(function(resp){
                    callback(resp);
                }).catch(function(err){
                console.error('Somethingwent wrong!', err);
            });
            break;
        case 'grabCurrentMusic':
            spotifyApi[data.username].getMyCurrentPlaybackState({})
                .then(function(resp) {
                    console.log(resp);
                    // Output items
                    callback(resp.body);
                    console.log("Now Playing: ",resp.body.item.name);
                }).catch(function(err){
                console.error('Something went wrong!', err);
            });
            break;
        case 'new_user':
            // Ensures that the access token works
            spotifyApi[data.username] = new SpotifyWebApi({
                clientId : client_id,
                clientSecret : client_secret,
                redirectUri : redirect_uri
            });

            callback("success");
            break;

        case 'refresh':
            // requesting access token from refresh token
            authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: data.token
                }, json: true
            };

            request.post(authOptions, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    spotifyApi[data.username].setAccessToken(body.access_token);
                    callback({access_token: body.access_token});
                }
            });
            break;

        case 'login':
            // your application requests authorization
            var url = 'https://accounts.spotify.com/authorize?' +
                querystring.stringify({
                    response_type: 'code',
                    client_id: client_id,
                    scope: scope,
                    redirect_uri: redirect_uri,
                    state: data.state
                });

            console.log(url)
            return url;

        case 'callback':
            console.log("CHECKED");

            var code = data.code;
            var state = data.state;
            var storedState = data.storedState;

            if (state === null || state !== storedState) {
                return {
                    response: 'failed',
                    command: '/#' + querystring.stringify({error: 'state_mismatch'})
                }
            } else {
                return {response: 'clear', command: stateKey};
            }

        case 'callbackV2':
            var code = data.code;
            var state = data.state;
            var storedState = data.storedState;

            authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                },
                json: true
            };

            return authOptions;

        case 'grabTracksFromPlaylist':
            spotifyApi[data.username].setAccessToken(data.access_token);

            console.log(data.playlist + " >>>")
            spotifyApi[data.username].getPlaylist(data.playlist)
                .then(function(data) {
                    callback(data.body.tracks.items)
                }, function(err) {
                    console.log('Grabbing tracks error: ', err);
                });
            break;

        case 'grabFeaturesFromTracks':
            spotifyApi[data.username].setAccessToken(data.access_token);
            otherSpotify.grabFeatures(spotifyApi[data.username], false, data.trackURIs, (list) => {
                console.log(list)
                callback(list)
            });
            break;

        case 'grabPlaylists':
            spotifyApi[data.username].setAccessToken(data.access_token);
            spotifyApi[data.username].getMe()
                .then(function(data_root){
                    let playlist = [];

                    return spotifyApi[data.username].getUserPlaylists(data_root.body.id)
                        .then(function(return_data) {
                            return_data.body.items.forEach(function(element){
                                playlist.push({
                                    name: element.name,
                                    id: element.id
                                });
                            });
                            return playlist;
                        })
                        .catch(function(err){
                            console.error(err);
                        });
                }).then(function(resp){
                    callback({success: true, data: resp});
                }).catch(function(err){
                    console.log("Get Me Error: ", err);
                    callback({success: false});
                });
            break;

        case 'set_get':
            spotifyApi[data.username] = new SpotifyWebApi({
                clientId : client_id,
                clientSecret : client_secret,
                redirectUri : redirect_uri
            });

            spotifyApi[data.username].setAccessToken(data.access_token);

            let response={};

            spotifyApi[data.username].getMe()
                .then(function(data_root){

                    var build = data.data || {};
                    build.user_id = data_root.body.id;

                    return build;
                }).then(function(resp){
                callback(resp);
            })
                .catch(function(err){
                    console.error(err);
                });
            break;

        case 'getMe':
            let tmp = new SpotifyWebApi({
                clientId : client_id,
                clientSecret : client_secret,
                redirectUri : redirect_uri
            });

            tmp.setAccessToken(data.access_token);

            tmp.getMe()
                .then(function(data_root){
                    console.log(data_root)
                    callback({
                        username: data_root.body.id,
                        name: data_root.body.display_name,
                        image: data_root.body.images[0].url
                    });
                })
                .catch(function(err){
                    console.error(err);
                });
            break;

        case 'check_account':
            mongoose('get', {username: data.username}, null, null, function(respData){
                if(respData.spotify.access_token){
                    callback({response: 'success', data: respData });
                } else {
                    callback({response: 'failed'});
                }
            });
            break;

        case 'grabToken':
            callback(spotifyApi[data.username]);
            break;


        // PLAYLIST CONTROLS
        /*case 'checkRecommendPlaylistExists':
            spotifyApi[data.username].getAudioFeatures(data.trackURI)
                .then(function(data) {
                    // Output items
                    callback(data.body.item);
                    console.log("Now Playing: ",data.body.item.name);
                }, function(err) {
                    console.log('Something went wrong!', err);
                });
            break;*/
        case 'createPlaylist':
            spotifyApi[data.username].createPlaylist(data.username, data.playlistOptions.name, {public: !JSON.parse(data.playlistOptions.is_private)})
                .then(function(data) {
                    callback({success: true, data:data})
                }, function(err) {
                    console.log("Creating Playlist error: ", err)
                    callback({success: false, function: 'Creating Playlist', error:err})
                });
            break;
        case 'saveToPlaylist':
            spotifyApi[data.username].getPlaylistTracks(data.playlistOptions.id)
            .then(function(returnedData){
                let existingTracks = {};

                let tracks = returnedData.body.items;
                for (let index = 0; index < tracks.length; index ++) {
                    if(tracks[index].track.id){
                        existingTracks[tracks[index].track.id] = true;
                    }
                }

                let uriArray = [];
                for (let index in data.music) {
                    if (data.music.hasOwnProperty(index) && !existingTracks.hasOwnProperty(data.music[index].id)) { // Ensuring no duplication
                        console.log(">>", data.music[index]);
                        uriArray.push("spotify:track:" + data.music[index].id);
                    }
                }

                if(uriArray.length){
                    console.log("Saving to:")
                    console.log(data.playlistOptions.id)
                    console.log(uriArray)

                    spotifyApi[data.username].addTracksToPlaylist(data.playlistOptions.id, uriArray)
                        .then(function(data){
                            callback({success: true, data:data})
                        }).catch(function(err){
                        console.log("Adding to playlist error: ", err);
                        callback({success: false, function: 'Adding songs to playlist', error:err})
                    });
                } else {
                    callback({success: false, function: "Adding songs to playlist", error: "Song or songs already exist within the playlist"})
                }
            }).catch(function(err){
                callback({success: false, function: "Grabbing tracks from saved playlist", error: err})
            });
            break;
        case 'changePlaylistInformation': // TODO - Enable detail changes.
           let newChanges = JSON.parse(data.new_changes);
            spotifyApi[data.username].changePlaylistDetails(data.playlistOptions.id,
               {
                   name: newChanges.new_name,
                   public : newChanges.privatePlaylist
               }).then(function(data) {
               console.log(data)
               console.log(data.playlistOptions.id)
               callback({success:true, data: {name: data.new_changes.new_name, is_private: data.new_changes.privatePlaylist}})
            }, function(err) {
               console.log('Modifying playlist details: ', err);
               callback({success:false, function: 'Modifying playlist information', error: err})
            });
            break;
        case 'clearPlaylist':
            spotifyApi[data.username].getPlaylistTracks(data.playlistOptions.id)
                .then(function(returnedData) {
                    let existingTracks = [];

                    let tracks = returnedData.body.items;
                    for (let index = 0; index < tracks.length; index++) {
                        if (tracks[index].track.id) {
                            existingTracks.push({uri: "spotify:track:"+tracks[index].track.id});
                        }
                    }

                    if (existingTracks.length) {
                        console.log(existingTracks)
                        const options = {  };
                        spotifyApi[data.username].removeTracksFromPlaylist(data.playlistOptions.id, existingTracks, options)
                            .then(function() {
                                console.log("Success")
                                callback({success: true});
                            })
                            .catch(function(err){
                                console.log("FAILED at deleting: ", err)
                                callback({success: false, function: "Clearing playlist", error: err})
                            });
                    } else {
                        callback({success: false, function: "Finding tracks", error: "No tracks found?"})
                    }
                }).catch(function(err) {
                console.log("FAILED at deleting2: ", err)
                callback({success: false, function: "Grabbing tracks from saved playlist to clear everything", error: err})
            });
            break;
        case 'deletePlaylist': // TODO - Adding a deleting recommended playlist on user profile.
                console.log(data)
                spotifyApi[data.username].unfollowPlaylist(data.playlistOptions.id)
                    .then(function() {
                        callback({success: true})
                    }, function(err) {
                        console.log("Error while deleting playlist: ", err)
                        callback({success: false, function: "Deleting playlist", error: err})
                    });
            break;
        case 'setAccessToken':
            spotifyApi[data.username].setAccessToken(data.access_token);
            break;
    }
};
