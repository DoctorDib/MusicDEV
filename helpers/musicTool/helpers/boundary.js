const Decimal = require('linear-arbitrary-precision')(require('floating-adapter'));
const normalise = require('normalise')(Decimal).normalise;

module.exports = (field, val, counter) => {
    return Number(Number(normalise([0, counter.max], val).toString()).toFixed(4));
};