const keys = require('./secretKeys.json');
const client_id = keys.spotify.client_id;
const client_secret = keys.spotify.client_secret;
const redirect_uri = keys.spotify.spotify_callback;

var request = require('request');
var SpotifyWebApi = require('spotify-web-api-node');

let spotifyApi = {};

const querystring = require('querystring');


var stateKey = 'spotify_auth_state';


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
            .then(function(data) {
                console.log(data)
            // Output items
                callback(data.body.item);
                console.log("Now Playing: ",data.body.item.name);
            }, function(err) {
                console.log('Something went wrong!', err);
            });
            break;
        case 'new_user':
            spotifyApi[data.username] = new SpotifyWebApi({
                clientId : client_id,
                clientSecret : client_secret,
                redirectUri : redirect_uri
            });
            break;

        case 'refresh':
            // requesting access token from refresh token
            var refresh_token = data.token;
            var authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: refresh_token
                }, json: true
            };

            request.post(authOptions, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    var access_token = body.access_token;
                    return {'access_token': access_token}
                }
            });

        case 'login':
            // your application requests authorization
            var scope = 'user-read-private user-read-email user-library-read user-top-read user-read-playback-state';

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
            var temp_user = data.temp_user;

            if (state === null || state !== storedState) {
                return {
                    response: 'failed',
                    command: '/#' + querystring.stringify({error: 'state_mismatch'})
                }
            } else {
                return {repsonse: 'clear', command: stateKey};
            }

        case 'callbackV2':
            var code = data.code;
            var state = data.state;
            var storedState = data.storedState;
            var temp_user = data.temp_user;

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

            return authOptions

        case 'set_get':
            spotifyApi[data.username].setAccessToken(data.access_token);

            return spotifyApi[data.username].getMe()
                .then(function(data_root){

                    var build = data.data || {};
                    var playlist = [];

                    build.user_id = data_root.body.id;

                    mongoose('update', {username: data.username}, "picture", data_root.body.images[0].url);

                    spotifyApi[data.username].getUserPlaylists(data_root.body.id)
                        .then(function(return_data) {
                            return_data.body.items.forEach(function(element){
                                playlist.push({
                                    name: element.name,
                                    id: element.id
                                });
                                console.log(playlist)
                            });
                            return playlist;
                        }). then(function(data_pass){
                        build.playlists = data_pass;
                        mongoose('update', {username: data.username}, "spotify", build);
                    });

                    return build;

                }).then(function(data){
                    return data;
                })
                .catch(function(err){
                    console.log(err);
                });
    }
}
