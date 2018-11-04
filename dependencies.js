const dependable = require('dependable');
const path = require('path');

const container = dependable.container();
const modules = [
    ['multer', 'multer'],
    ['passport', 'passport'],
    ['util', 'util'],
    ['async', 'async'],
    ['fs', 'fs'],
    ['path', 'path'],
    ['pg', 'pg'],
    ['ws', 'ws']
];

modules.forEach(function(val){
    container.register(val[0], function(){
        return require(val[1]);
    })
});

container.load(path.join(__dirname, '/routers'));
container.load(path.join(__dirname, '/helpers'));

container.register('container', function(){
    return container;
});

module.exports = container;