const neo4j = require('neo4j');
const featureManager = require('./trackFeatureManager');
const secret = require('../../../config/config');

const config = require('../../../config/config');

let graphDatabase = 'http://'+secret.neo4j.username+':'+secret.neo4j.password+'@'+secret.neo4j.ip+':'+secret.neo4j.port;
const db = new neo4j.GraphDatabase(graphDatabase);

const async = require('async');

function featuresString() {
    /*[
        a["danceability"],
        a["energy"],
        a["key"],
        a["loudness"],
        a["speechiness"],
        a["acousticness"],
        a["instrumentalness"],
        a["liveness"],
        a["valence"],
        a["tempo"]
    ]*/ // EXPECTED FORMAT

    let finalString = '';
    for (let feature in config.track_features) {
        if (config.track_features.hasOwnProperty(feature)) {
            if (config.track_features[feature]) {
                finalString = finalString + ` a["${feature}"],`;  // TODO POSSIBLE ISSUE WITH THE COMMA
            }
        }
    }

    return `[${finalString}]`;
}

const run = (func, data, callback) => {
    let query, properties;
    switch (func) {
        case 'create':
            console.log(data)
            let song = data.params;

            console.log("================================")
            console.log(song)
            console.log(song.genre)
            console.log("================================")

            properties = featureManager(song.features.hasOwnProperty('features') ? song.features.features: song.features, false);
            properties.name =  JSON.stringify(song.name);
            properties.id =  song.id;
            properties.genre =  song.genre;

            run('exists', {id: song.id, genre: song.genre}, resp => {
                if (resp.success) {
                    if (!resp.exist) {
                        db.cypher({
                            query: `MATCH(a:${song.genre}_Genre {id: "Genre"}) CREATE (a2:${song.genre} ${JSON.stringify(properties)})-[:GENRE_IS]->(a)`,
                        }, function (err, returnedData) {
                            console.log("Finished new training")
                            if (err) {
                                console.log(err)
                            } else {
                                console.log("h")
                                callback({success: true, data: returnedData, oldData: data});
                            }
                        });
                    } else {
                        callback({success: false, error: "Node already exists!", function: "Checking if the data exists... prt2"})
                    }
                } else {
                    callback({ success: false, error: resp.error, function: "Checking if the data exists..." })
                }
            });

            break;
        case 'masterLearn':

            console.log('-------------------------------------------')
            console.log(`Relation learning stated for: ${data.genre}`)

            query = `MATCH (a:${data.genre})
                        WITH id(a) as id, ${featuresString()} as weights
                        
                        WITH {item: id, weights: weights} as userData
                        WITH collect(userData) as data
                        CALL algo.similarity.cosine.stream(data,{similarityCutoff:0.9,topK:2})
                        YIELD item1, item2, count1, count2, similarity
                       
                        MATCH (a:${data.genre} {id: algo.getNodeById(item1).id})
                        MATCH (a2:${data.genre} {id: algo.getNodeById(item2).id})
                        MERGE (a)-[:SIMILAR]->(a2)
                        
                        WITH item1,item2,similarity 
                        where item1 > item2
                        
                        RETURN true`;

            db.cypher({
                query: query,
            }, function (err, data) {
                if (err) {
                    console.log(err)
                    //callback({success: false, error: err});
                } else {
                    console.log('FINISHED')
                    callback({success: true, data: data});
                }
            });
            break;
        case 'masterDelete':
            query = `MATCH (n)
                OPTIONAL MATCH (n)-[r]-()
                DELETE n,r
                RETURN true`;
            console.log("Deletion stated...")

            db.cypher({
                query: query,
            }, function (err, data) {
                if (err) {
                    callback({success: false, error: err});
                } else {
                    console.log('DELETED')
                    callback({success: true, data: data});
                }
            });
            break;
        case 'initialise':
            query = `CREATE (a:${data.id} {id: ${JSON.stringify(data.id)}, name: ${JSON.stringify(data.id)}}) RETURN a`;
            db.cypher({
                query: query,
            }, function (err) {
                if (err) {
                    console.log(err)
                    //callback({success: false, error: err});
                } else {

                    async.eachOfSeries(data.genres, function (genre, genreKey, genreCallback) {
                        /*
                        MATCH (a:Person),(b:Person)
                        WHERE a.name = 'A' AND b.name = 'B'
                        CREATE (a)-[r:RELTYPE]->(b)
                        RETURN type(r)*/
                        query = `MATCH (a:Spotify) CREATE (a2:${genre}_Genre {id: 'Genre', name: ${JSON.stringify(genre)}})-[:FROM]->(a)`;

                        db.cypher({
                            query: query,
                        }, function (err) {
                            if (err) {
                                console.log(err)
                            } else {
                                if (genreKey+1 >= data.genres.length) {
                                    callback({success: true, data: data});
                                } else {
                                    genreCallback();
                                }
                            }
                        });
                    });
                }
            });
            break;
        case 'exists':
            query = `MATCH (a:${data.genre} {id: ${JSON.stringify(data.id)}}) RETURN a`;

            db.cypher({
                query: query,
            }, function (err, data) {
                if (err) {
                    console.log("NEO Exist function error: ", err)
                    callback({success: false, error: err});
                } else {
                    callback({success: true, exist: Boolean(data.length)})
                }
            });
            break;
        case 'learn':
            properties = featureManager(data.song.features, false);
            properties.id = data.song.id;
            properties.name = data.song.name;
            properties.genre = data.song.genre;

            // CREATE NEW NODE
            query = `CREATE (a:${data.song.genre} ${JSON.stringify(properties)} ) RETURN a`;
            console.log(`Create query = ` + query)

            db.cypher({
                query: query,
            }, function (err) {
                if (err) return console.log("Creating node error: " + err);
                console.log("Created node successfully")

                console.log("Learning")
                query = `
                    MATCH (a:${data.genre})
                    WITH id(a) as id, ${featuresString()} as weights
                    
                    WITH {item: id, weights: weights} as userData
                    WITH collect(userData) as data
                    CALL algo.similarity.cosine.stream(data,{similarityCutoff:0.9,topK:2})
                    YIELD item1, item2, count1, count2, similarity
                   
                    MATCH (a:${data.genre} {id: algo.getNodeById(item1).id})
                    MATCH (a2:${data.genre} {id: algo.getNodeById(item2).id})
                    MERGE (a)-[:SIMILAR]->(a2)
                    
                    WITH item1,item2,similarity 
                    where item1 > item2
                    
                    RETURN true`;

                console.log("Relearning...")
                db.cypher({
                    query: query,
                }, function (err) {
                    if (err) callback({success: false, error: err});
                    console.log("Done")
                    db.cypher({
                        query: recommendQuery,
                    }, function (err, data) {
                        if (err) {
                            callback({success: false, error: err});
                        } else {
                            callback({success: true, data: data});
                        }
                    });
                });
            });
            break;
        case 'recommend':
            properties = featureManager(data.song.features, false);
            query = `MATCH (a:${data.genre} ${JSON.stringify(properties)})-[:SIMILAR]-(returnedNode) RETURN returnedNode`;

            console.log("=================================")
            console.log(query)

            db.cypher({
                query: query,
            }, function (err, data) {
                console.log("response?")
                console.log(data)
                if (err || !data.length) {
                    console.log(err)
                    callback({success: false, error: err});
                } else {
                    callback({success: true, data: data});
                }
            });
            break;
    }
};

module.exports = (func, data, callback) => {
    run (func, data, (data)=> {
        callback(data);
    });
};



/*
    cypher('match (user:hi) return user')
        .on('data', function (result){
            console.log(result.user.first_name);
        })
        .on('end', function() {
            console.log('all done');
        })
    ;

    console.log("Starteded")
    console.log(graphDatabase)*/

    /*db.cypher({
        query: 'MATCH (u:User {email: {email}}) RETURN u',
        params: {
            email: 'alice@example.com',
        },
    }, function (err, results) {
        if (err) console.log(err);
        var result = results[0];
        if (!result) {
            console.log('No user found.');
        } else {
            var user = result['u'];
            console.log(JSON.stringify(user, null, 4));
        }
    });*/


