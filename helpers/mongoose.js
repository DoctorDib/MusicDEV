const User = require('../models/user');

module.exports = (func, ident, set, object, callback) => {
    switch(func) {
        case 'update':
            User.update(ident, {[set] : object}, err => {
                if(err){
                    console.log("UPDATE: Failed...")
                } else {
                    console.log("UPDATE: Complete...")
                }
            });
            break;
        case 'get':
            return User.findOne(ident).exec((err, object) => {
                callback(object);
            });
    }
};
