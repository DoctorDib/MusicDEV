const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id: {type: String, unique: true},
    username: {type: String, unique: true},
    name: {type: String},
    userImage: {type: String},
    newUser: {type: Boolean, default: true},
    activePlaylist: [],
    spotify: {
        access_token: {type: String},
        refresh_token: {type: String}
    }
});

module.exports = mongoose.model('User', userSchema);
