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
            var authOptions = {
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

            var authOptions = {
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
            console.log("^%$%^%$%^%$%^")
            console.log(data.trackURIs)
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
                        }).catch(function(err){
                            console.error(err);
                        });
                }).then(function(resp){
                callback({success: true, data: resp});
            }).catch(function(err){
                callback({success: false});
                console.error("Get Me Error: ", err);
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
    }
}
