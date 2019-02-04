const MongoClient = require('mongodb').MongoClient;

module.exports = (func, collection, data, callback) => {
    MongoClient.connect("mongodb://localhost:27017/musicDEV", function (err, database) {
        if (err) return console.error(err);
        const db = database.db("musicDEV");

        switch (func) {
            case 'grabOne':
                if (data.options) {
                    db.collection(collection).findOne(data.identifier, data.options, function (err, records) {
                        if (err) callback({success: false, error: err});
                        callback({success: true, records: records});
                    });
                } else {
                    db.collection(collection).findOne(data.identifier, function (err, records) {
                        if (err) callback({success: false, error: err});
                        callback({success: true, records: records});
                    });
                }
                break;
            case 'grab':
                db.collection(collection).find(data.identifier, function (err, records) {
                    if (err) callback({success: false, error: err});
                    callback({success: true, records: records});
                });
                break;
            case 'update':
                db.collection(collection).update(data.identifier, {$set: data.data});
                break;
            case 'updatePush':
                db.collection(collection).update(data.identifier, {$push: data.data});
                break;
            default:
                callback({success: false, error: `Command "${func}" not found.`});
                break;
        }
    });
};