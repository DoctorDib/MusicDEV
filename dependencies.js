const dependable = require('dependable');
const path = require('path');

const container = dependable.container();
const modules = [
    ['async', 'async'],
    ['passport', 'passport'],
];

modules.forEach(function(val){
    container.register(val[0], function(){
        return require(val[1]);
    })
});

container.load(path.join(__dirname, '/routers'));

container.register('container', function(){
    return container;
});

module.exports = container;