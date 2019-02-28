const spotify = require('../musicTool/helpers/spotifyApi');
const neo = require('../musicTool/helpers/neo4j');
const config = require('../../config/config');

const MongoClient = require('mongodb').MongoClient;
const SpotifyWebApi = require('spotify-web-api-node');
const Spotify = require('machinepack-spotify');

const spotifyApi = new SpotifyWebApi({
    clientId : config.spotify.client_id,
    clientSecret : config.spotify.client_secret,
    redirectUri : config.spotify.redirect_uri
});

MongoClient.connect(`mongodb://localhost:${config.mongo_settings.port}/${config.mongo_settings.name}`, function (err, database) {
    if (err) return console.error(err);
    const db = database.db(config.mongo_settings.name);

    let processing = false;
    let useCollection = db.collection('blacklist');

    function finished() {
        // relearn
        // Once complete replace with old database
    }

    function processTracks(tracks) {
        // Loops Async through tracks
        // Add all tracks as nodes to Neo4j database
        // call finished();


    }

    function tick() {
        let hour = new Date().getHours();
        let mins = new Date().getMinutes();

        // hours and mins = 0 (midnight
        if (hour === 0 && mins === 0 && !processing) {
            processing = true;

            useCollection.find({id: "blacklist"}, (err, blacklist) => {
                if (Object.keys(blacklist).length) {
                    processTracks(blacklist);
                } else {
                    console.log("No tracks have been blacklisted... continue.")
                }
            });
        }

        if (hour === 0 && mins === 1) {
            processing = false; // Resetting for the next usage.
        }
    }

    setInterval(()=> {
        tick();
    }, config.blacklist_options.tick_interval * 1000);
});