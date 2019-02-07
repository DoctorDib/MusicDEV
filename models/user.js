const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id: {type: String, unique: true},
    username: {type: String, unique: true},
    displayName: {type: String},
    photos: [],
    newUser: {type: Boolean, default: true},
    activePlaylists: [],
    history: [],
    playlistOptions: {
        id: {type: String, unique: true},
        name: {type: String},
        is_private: {type: Boolean},
        is_active: {type: Boolean},
        savedTracks: [],
    },
    spotify: {
        access_token: {type: String},
        refresh_token: {type: String}
    }
});

module.exports = mongoose.model('User', userSchema);
