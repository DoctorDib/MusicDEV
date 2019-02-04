const neo4j = require('neo4j');
const secret = require('../../secretKeys');

let graphDatabase = 'http://'+secret.neo4j.username+':'+secret.neo4j.password+'@'+secret.neo4j.ip+':'+secret.neo4j.port;
const db = new neo4j.GraphDatabase(graphDatabase);

const async = require('async');

// data.name => data.params

module.exports = function (func, data, callback) {

    switch (func) {
        case 'create':
            console.log(data)
            let song = data.params;

            console.log("================================")
            console.log(song)
            console.log(song.genre)
            console.log("================================")

            let propertyCreate = ` {
                name: ${JSON.stringify(song.name)},
                id: \"${song.id}\",
                genre: \"${song.genre}\",
                danceability: ${song.features.features.danceability},
                energy: ${song.features.features.energy},
                key: ${song.features.features.key},
                loudness: ${song.features.features.loudness},
                speechiness: ${song.features.features.speechiness},
                acousticness: ${song.features.features.acousticness},
                instrumentalness: ${song.features.features.instrumentalness},
                liveness: ${song.features.features.liveness},
                valence: ${song.features.features.valence},
                tempo: ${song.features.features.tempo}
            }`;

            db.cypher({
                query: `MATCH(a:${song.genre}_Genre {id: "Genre"}) CREATE (a2:${song.genre} ${propertyCreate})-[:GENRE_IS]->(a)`,
            }, function (err, returnedData) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("h")
                    callback({success: true, data: returnedData, oldData: data});
                }
            });
            break;
        case 'masterLearn':
            console.log('-------------------------------------------')
            console.log(`Relation learning stated for: ${data.genre}`)

            try {
                let query = `MATCH (a:${data.genre})
                        WITH id(a) as id, [
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
                        ] as weights
                        
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
            } catch(e) {
                console.log(e)
            }
            break;
        case 'masterDelete':
            let deleteQuery = `MATCH (n)
                OPTIONAL MATCH (n)-[r]-()
                DELETE n,r
                RETURN true`;

            db.cypher({
                query: deleteQuery,
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
            let initialQuery = `CREATE (a:${data.id} {id: ${JSON.stringify(data.id)}, name: ${JSON.stringify(data.id)}}) RETURN a`;
            db.cypher({
                query: initialQuery,
            }, function (err, returnedData) {
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
                        let initialQueryStep2 = `MATCH (a:Spotify) CREATE (a2:${genre}_Genre {id: 'Genre', name: ${JSON.stringify(genre)}})-[:FROM]->(a)`;

                        db.cypher({
                            query: initialQueryStep2,
                        }, function (err, returnedData) {
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
            let findQuery = `MATCH (a:${data.genre} {id: ${JSON.stringify(data.id)}}) RETURN a`;

            db.cypher({
                query: findQuery,
            }, function (err, data) {
                if (!data.length) {
                    callback({success: false, error: err})
                } else {
                    callback({success: true});
                }
            });
            break;
        case 'learn':
            let propertie = `{
                    danceability: ${data.song.features.danceability},
                    energy: ${data.song.features.energy},
                    key: ${data.song.features.key},
                    loudness: ${data.song.features.loudness},
                    speechiness: ${data.song.features.speechiness},
                    acousticness: ${data.song.features.acousticness},
                    instrumentalness: ${data.song.features.instrumentalness},
                    liveness: ${data.song.features.liveness},
                    valence: ${data.song.features.valence},
                    tempo: ${data.song.features.tempo}
                }`;
            console.log("No data found, creating new node")
            let newProperties = propertie.replace('}', `, name: "${data.song.name}", id: "${data.song.id}", genre: "${data.song.genre}" }`);

            // CREATE NEW NODE
            let createQuery = `CREATE (a:${data.song.genre} ${newProperties} ) RETURN a`;
            console.log(`Create query = ` + createQuery)

            db.cypher({
                query: createQuery,
            }, function (err, returnedDATA) {
                if (err) return console.log("Creating node error: " + err);
                console.log("Created node successfully")

                console.log("Learning")
                let query = `
                    MATCH (a:${data.genre})
                    WITH id(a) as id, [
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
                    ] as weights
                    
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
                }, function (err, data) {
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

            let properties = `{
                danceability: ${data.song.features.danceability},
                energy: ${data.song.features.energy},
                key: ${data.song.features.key},
                loudness: ${data.song.features.loudness},
                speechiness: ${data.song.features.speechiness},
                acousticness: ${data.song.features.acousticness},
                instrumentalness: ${data.song.features.instrumentalness},
                liveness: ${data.song.features.liveness},
                valence: ${data.song.features.valence},
                tempo: ${data.song.features.tempo}
            }`;
            let recommendQuery = `MATCH (a:${data.genre} ${properties})-[:SIMILAR]-(returnedNode) RETURN returnedNode`;

            console.log("=================================")
            console.log(recommendQuery)

            db.cypher({
                query: recommendQuery,
            }, function (err, data) {
                console.log("response?")
                console.log(data)
                if (err) {
                    console.log(err)
                    callback({success: false, error: err});
                } else {
                    callback({success: true, data: data});
                }
            });
            break;
    }
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


