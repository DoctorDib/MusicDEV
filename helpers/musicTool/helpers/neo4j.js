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

    let finalString = '', index=1;
    for (let feature in config.track_features) {
        index ++;
        if (config.track_features.hasOwnProperty(feature)) {
            if (config.track_features[feature]) {
                let string = index > Object.keys(config.track_features).length ? ` a["${feature}"]` : ` a["${feature}"],`;
                finalString = finalString + string;  // TODO POSSIBLE ISSUE WITH THE COMMA
            }
        }
    }
    return `[${finalString}]`;
}

function propertyManager(properties) {
    let final = '', index=0;

    for (let feature in properties) {
        index++;
        if (properties.hasOwnProperty(feature)) {
            let comma = index >= Object.keys(properties).length ? '' : ',';
            final = final += `${feature}: ${properties[feature]}${comma}`
        }
    }

    return `{${final}}`;
}

const run = (func, data, callback) => {
    let query;
    switch (func) {
        case 'merge':
            db.cypher({
                query: 'WITH toLower(n.name) as name, collect(n) as nodes CALL apoc.refactor.mergeNodes(nodes) yield node RETURN *',
                params: { properties: properties }
            }, function (err, returnedData) {
                if (err) {
                    console.log(err)
                } else {
                    callback({success: true, data: returnedData, oldData: data});
                }
            });

            break;
        case 'create':
            let song = data.params;
            console.log(song)
            console.log("================================")

            featureManager(song.features.hasOwnProperty('features') ? song.features.features: song.features, false, properties => {
                properties.name =  song.name;
                properties.id =  song.id;
                properties.genre =  song.genre;

                run('exists', {id: song.id, genre: song.genre}, resp => {
                    if (resp.success) {
                        if (!resp.exist) {

                            db.cypher({
                                query: `MATCH(a:${song.genre}_Genre {id: "Genre"}) CREATE (a2:${song.genre} {properties})-[:GENRE_IS]->(a)`,
                                params: { properties: properties }
                            }, function (err, returnedData) {
                                if (err) {
                                    console.log(err)
                                    callback({success: false, data: returnedData, oldData: data});
                                } else {
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
            });
            break;
        case 'masterLearn':

            console.log('-------------------------------------------')
            console.log(`Relation learning stated for: ${data.genre}`)

            //algo.similarity.jaccard.stream( // new

            query = `MATCH (a:${data.genre})
                        WITH id(a) as id, ${featuresString()} as weights
                        
                        WITH {item: id, weights: weights} as userData
                        WITH collect(userData) as data
                        CALL algo.similarity.cosine.stream(data,{graph: 'cypher', similarityCutoff: 0.8, topK: 2})
                        YIELD item1, item2, count1, count2, similarity
                       
                        MATCH (a:${data.genre} {id: algo.getNodeById(item1).id})
                        MATCH (a2:${data.genre} {id: algo.getNodeById(item2).id})
                        MERGE (a)-[:SIMILAR]->(a2)
                        
                        WITH item1,item2,similarity 
                        where item1 > item2
                        
                        RETURN true`;

            db.cypher({
                query: query,
                params: {
                    genre: data.genre,
                    stringFeatures: featuresString()
                }
            }, (err, data) => {
                if (err) {
                    console.log(err)
                    //callback({success: false, error: err});
                } else {
                    console.log('FINISHED')
                    callback({success: true, data: data});
                }
            });
            break;
        case 'masterDeleteRelations':
            db.cypher({
                query: 'MATCH ()-[r:RELEASED]-() DELETE r',
            }, function (err, data) {
                if (err) {
                    callback({success: false, error: err});
                } else {
                    console.log('DELETED')
                    callback({success: true, data: data});
                }
            });
            break;
        case 'masterDelete':
            db.cypher({
                query: 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r RETURN true',
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
            query = ``;
            db.cypher({
                query: `CREATE (a:${data.id} {id: {id}, name: {id}}) RETURN a`,
                params: { id: data.id }
            }, function (err) {
                if (err) {
                    console.log(err)
                    //callback({success: false, error: err});
                } else {
                    async.eachOfSeries(data.genres, function (genre, genreKey, genreCallback) {
                        db.cypher({
                            query: `MATCH (a:Spotify) CREATE (a2:${genre}_Genre {id: 'Genre', name: {genre}})-[:FROM]->(a)`,
                            params: {
                                genre: genre
                            }
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
            db.cypher({
                query: `MATCH (a:${data.genre} {id: "${data.id}"}) RETURN a`,
            }, function (err, data) {
                if (err) {
                    console.log("NEO Exist function error: ", err);
                    callback({success: false, error: err});
                } else {
                    callback({success: true, exist: Boolean(data.length)})
                }
            });
            break;
        case 'learn':
            featureManager(data.song.features, false, properties => {
                properties.id = data.song.id;
                properties.name = data.song.name;
                properties.genre = data.song.genre;

                db.cypher({
                    query: `CREATE (a:${data.song.genre} {properties}) RETURN a`,
                    params: {
                        properties: properties,
                    }
                }, function (err) {
                    if (err) return console.log("Creating node error: " + err);
                    console.log("Created node successfully")

                    console.log("Learning")
                    query = `
                    MATCH (a:${data.genre})
                    WITH id(a) as id, {stringList} as weights
                    
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
                        params: {
                            genre: data.genre,
                            stringList: featuresString()
                        }
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
            });
            break;
        case 'recommend':
            featureManager(data.song.features, false, properties => {
                db.cypher({
                    query: `MATCH (a:${data.genre} ${propertyManager(properties)})-[:SIMILAR]-(returnedNode) RETURN returnedNode`,
                }, function (err, respData) {
                    if (err || !respData.length) {
                        console.log(err)
                        callback({success: false, error: err});
                    } else {
                        callback({success: true, data: respData});
                    }
                });
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


