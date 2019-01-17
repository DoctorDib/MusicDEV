const client_id = '50f8bb0e51b84bc384ae4362db6bafc4';
const client_secret = '39da26439393455582b057386f8f5388';
const redirect_uri = 'http://fyp.jamesdibnah.co.uk/spotify_callback';

const MongoClient = require('mongodb').MongoClient;

const SpotifyWebApi = require('spotify-web-api-node');

const async = require('async');
const _ = require('underscore');

const ml = require('machine_learning');

const Spotify = require('machinepack-spotify');
let spotifyApi = new SpotifyWebApi({
    clientId : client_id,
    clientSecret : client_secret,
    redirectUri : redirect_uri
});


function setUpAccount(callback){
    Spotify.getAccessToken({
        clientId: client_id,
        clientSecret: client_secret,
    })
    .exec({
        error: function (err) {
            console.log("Access Token: " + err)
        },
        success: function (access) {
            spotifyApi.setAccessToken(access);
            console.log("ACCESS TOKEN SENT");
            callback();
        }
    });
}


let URI = '6FKoWql5Eb98kqaeplCgzp';



function grabFeatures(trackURI, callback) {
    spotifyApi.getAudioFeaturesForTrack(trackURI)
        .then(function(data) {
            let features = {};
            let tmp = data.body;
            console.log(tmp)
            features.energy = tmp.energy;
            features.key = tmp.key;
            features.loudness = tmp.loudness;
            features.speechiness = tmp.speechiness;
            features.acousticness = tmp.acousticness;
            features.instrumentalness = tmp.instrumentalness;
            features.liveness = tmp.liveness;
            features.valence = tmp.valence;
            features.tempo = tmp.tempo;
            features.time_signature = tmp.time_signature;

            callback(features)

        }, function(err) {
            console.log("ERROR: ", err)
        });
}

let x;
let y;

function predict (trackInfo, cats, callback){

    let x = [];
    let y =  [-1, 1];
    async.eachOfSeries(cats, function (value, chunkKey, loopCallback) {
        if(!(chunkKey >=1)){
            x.push(value.data);
            loopCallback();
        } else {
            x.push(value.data);

            console.log(x)

            let svm = new ml.SVM({x:x, y:y});

            svm.train({
                C : 1.1,
                tol : 1e-5,
                max_passes : 2,
                alpha_tol : 1e-5,
                kernel : {
                    type : "gaussian",
                    sigma : 0.5
                }
            });

            let pred = svm.predict(trackInfo[0]);

            console.log(">>> " + pred)

            if(pred === -1){
                x.splice(1, 1);
            } else {
                x.splice(0, 1);
            }
            console.log(cats.length)
            console.log(chunkKey)
            if(chunkKey+1 === cats.length){
                callback(trackInfo, x);
            } else {
                loopCallback();
            }
        }
    });
}

MongoClient.connect("mongodb://localhost:27017/musicDEV", function(err, database) {
    if(err) return console.error(err);

    const db = database.db("musicDEV");
    const collection = db.collection('musicCatAvg');

    setUpAccount(function(){
        grabFeatures(URI, function(resp){
            let data = [];
            let centers = [];

            data.push([
                resp.energy,
                resp.key,
                resp.loudness,
                resp.speechiness,
                resp.acousticness,
                resp.instrumentalness,
                resp.liveness,
                resp.valence,
                resp.tempo,
                resp.time_signature ]);

            collection.find({}, function(err, resp) {
                resp.forEach(function(cats) {
                    centers.push({
                        catName: cats.category,
                        data: [
                            Number(cats.energy),
                            Number(cats.key),
                            Number(cats.loudness),
                            Number(cats.speechiness),
                            Number(cats.acousticness),
                            Number(cats.instrumentalness),
                            Number(cats.liveness),
                            Number(cats.valence),
                            Number(cats.tempo),
                            Number(cats.time_signature)
                        ]
                    });
                });
            });
            setTimeout(() => {
                predict(data, centers, (trackInfo, prediction) => {
                    for(i=0; i< centers.length; i++){
                        if(_.isMatch(centers[i].data, prediction[0])){
                            console.log("FEATURES: ", trackInfo[0]);
                            console.log("FINAL PREDICTION: ", centers[i]);
                            break;
                        }
                    }
                });
            }, 1500)
        });
    })



    /*setUpAccount(function(){
        console.log("=========================================================================================");
        grabPlaylists(process.argv[2], function(){

        });
    })*/


    // 5YABOhuYBuClFRgjlQNdoh
});
