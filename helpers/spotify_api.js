const keys = require('../config/config');
const client_id = keys.spotify.client_id;
const client_secret = keys.spotify.client_secret;
const redirect_uri = keys.spotify.spotify_callback;

const SpotifyWebApi = require('spotify-web-api-node');
const otherSpotify = require('./musicTool/helpers/spotifyApi');

let spotifyApi = {};

module.exports = function(command, data, callback) {
    switch(command){
        case 'analyseTrack':
            otherSpotify.grabFeatures(data.trackURI)
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

        // PLAYLIST CONTROLS
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
        case 'deletePlaylistTrack':
            console.log(data)
            let tracks = [{ uri : "spotify:track:"+data.uri }];
            let options = { };
            console.log(tracks)
            spotifyApi[data.username].removeTracksFromPlaylist(data.playlistOptions.id, tracks, options)
                .then(function(data) {
                    callback({success: true})
                }, function(err) {
                    console.log('Something went wrong!', err);
                });
            break;

        case 'setAccessToken':
            spotifyApi[data.username].setAccessToken(data.access_token);
            break;
        case 'grabToken':
            callback(spotifyApi[data.username]);
            break;
    }
};
