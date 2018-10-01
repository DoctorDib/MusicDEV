var User = require('../models/user');

// mongoose('get', {username: <USERNAME>})

module.exports = function(func, ident, set, object, callback) {
    if(func === 'update'){
        User.update(ident, {[set] : object}, function(err){
            if(err){
                console.log("UPDATE: Failed...")
            } else {
                console.log("UPDATE: Complete...")
            }
        });
    } else if(func === 'get'){
        var test = User.findOne(ident);
        return test.exec(function(err, object){
            callback(object)
            return object;
        });
    }
}
