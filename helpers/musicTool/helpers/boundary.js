const MongoClient = require('mongodb').MongoClient;
const Decimal = require('linear-arbitrary-precision')(require('floating-adapter'));
const normalise = require('normalise')(Decimal).normalise;
const mongo = require('../../mongo');
const config = require('../../../config/config');

/*function clampPositive(field, value){
    return Number((((value / positiveMap[field]) / 2) + 0.5).toFixed(5));
}*/

/*function clampNegative(field, value){
    return Number(((Math.abs(value) / negativeMap[field]) / 2).toFixed(5));
}*/

// normalise([min, max], val);

module.exports = (field, val) => {



    //return normalise([0, max], val);

    /*if (field === "key" || field === "tempo") {
        return clampPositive(field, val);
    } else if (field === "loudness") {
        return clampNegative(field, val);
    } else if (field === "cleaning") {
        return val;
    } else {
        return val;
    }*/
};