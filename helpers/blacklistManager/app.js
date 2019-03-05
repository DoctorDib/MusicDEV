const spotify = require('../musicTool/helpers/spotifyApi');
const neo = require('../musicTool/helpers/neo4j');
const config = require('../../config/config');

const MongoClient = require('mongodb').MongoClient;
const SpotifyWebApi = require('spotify-web-api-node');
const Spotify = require('machinepack-spotify');
const async = require('async');

const axios = require('axios');
const later = require('later');

MongoClient.connect(`mongodb://localhost:${config.mongo_settings.port}/${config.mongo_settings.name}`, (err, database) => {
    if (err) return console.error(err);
    const db = database.db(config.mongo_settings.name);

    let processing = false;
    const useCollection = db.collection('blacklist');
    let interval;

    function finished(failedTracks) {
        async.eachOfSeries(config.recommendation_config.genres, (genre, genreKey, genreCallback) => {
            neo('masterLearn', {genre: genre}, () => {
                if(genreKey+1 >= config.recommendation_config.genres.length) {
                    console.log("Done")
                    console.log('finished')

                    db.collection("blacklist").update({blacklist: {$exists: true}}, {$set: {"blacklist": failedTracks} }, {upsert: true});
                } else {
                    genreCallback();
                }
            });
        });
    }

    function processTracks(tracks) {
        let index=0, totalLength=Object.keys(tracks).length;
        async.eachOfSeries(tracks, (track, trackKey, trackCallback) => {
            index++;
            // Removing unwanted data
            delete track.success;
            console.log(track)

            neo('create', {params: track}, res => {
                if (res.success || res.error === 'Node already exists!') {
                    // Removing track if it has been successfully added to database
                    delete tracks[trackKey];
                }

                if (index >= totalLength) {
                    finished(tracks);
                } else {
                    trackCallback();
                }
            });
        });
    }

    let blacklistInterval = 14 /*Days*/; // 2 weeks
    const textSched =  later.parse.text('every 2 weeks');

    function heartbeat(dev) {
        let day=new Date().getDay();

        // hours and mins = 0 (midnight
        if ((day % blacklistInterval === 0 && !processing) || dev) {
            //axios.post('/blacklistManager'); // TODO - SENDING A WARNING MESSAGE TO USERS
            processing = true;

            useCollection.findOne({}, (err, records) => {
                if (err) console.log(err);
                console.log(records.blacklist);

                if (Object.keys(records.blacklist).length) {
                    processTracks(records.blacklist);
                } else {
                    console.log("No tracks have been blacklisted... continue.")
                }
            });
        } else {
            processing = false; // Resetting for the next usage.
        }
    }

    if (process.argv[2] === "dev") { // DEV TOOL
        console.log("Dev tool active")
        heartbeat(true);
    } else { // DEFAULT
        console.log("Started default")
        console.log(textSched)
        t = later.setInterval(()=> {
            console.log("heartbeat...")
            heartbeat(false);
        }, textSched);
    }
});