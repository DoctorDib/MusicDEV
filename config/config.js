const secretKeys = require('./secretKeys');

module.exports = {
    classification_config: {
        config: {
            inputSize: 20,
            inputRange: 20,
            outputSize: 20,
            hiddenSizes: [5],
            learningRate: 0.1,
            decayRate: 0.9,
            binaryThresh: 0.5,     // ¯\_(ツ)_/¯
            activation: 'sigmoid'  // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh']
        },
        train: {
            iterations: 200000,    // the maximum times to iterate the training data --> number greater than 0
            errorThresh: 0.02,   // the acceptable error percentage from training data --> number between 0 and
            logPeriod: 25,        // iterations between logging out --> number greater than 0
            learningRate: 0.1,    // scales with delta to effect training rate --> number between 0 and 1
            momentum: 0.1,        // scales with next layer's change value --> number between 0 and 1
            callback: null,       // a periodic call back that can be triggered while training --> null or function
            callbackPeriod: 10,   // the number of iterations through the training data between callback calls --> number greater than 0
            timeout: Infinity     // the max number of milliseconds to train for --> number greater than 0
        },
        predict: {
            binaryThresh: 0.5,
            hiddenLayers: [3],     // array of ints for the sizes of the hidden layers in the network
            activation: 'sigmoid',  // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
            leakyReluAlpha: 0.01   // supported for activation type 'leaky-relu'
        }
    },
    recommendation_config: {
        activities: {
            Workout: ["Rock",	"RnB", "ElectronicAndDance"],
            Party: ["Pop", "HipHop", "Rock", "ElectronicAndDance"],
            Focus: ["Jazz", "Classical", "Blues"],
            Sleep: ["Classical", "Blues"],
            Romance: ["Classical", "Blues", "Jazz"],
            Gaming: ["Rock", "RnB", "ElectronicAndDance"],
            Dinner: ["Chill", "Jazz", "Classical"],
            Travel: ["Pop", "HipHop", "RnB"],
            Relax: ["Chill", "Jazz", "Classical"]
        },
        genres: ["Rock", "RnB", "ElectronicAndDance", "Pop", "HipHop", "Jazz", "Classical", "Blues", "Chill"],
        maxLimitSelection: 45000,
        maxGenreSelection: 10000
    },
    spotify: {
        client_id: secretKeys.spotify.client_id,
        client_secret: secretKeys.spotify.client_secret,
        spotify_callback: secretKeys.spotify.spotify_callback,
        scopes: ["user-read-private", "user-read-email", "user-library-read", "user-top-read", "user-read-playback-state", "playlist-modify-private", "playlist-modify-public"]
    },
    pushBullet: {
        api_token: secretKeys.pushBullet.api_token
    },
    neo4j: {
        username: secretKeys.neo4j.username,
        password: secretKeys.neo4j.password,
        ip: secretKeys.neo4j.ip,
        port: secretKeys.neo4j.port
    },
    table_settings: {
        max_limit: 10
    }
};
