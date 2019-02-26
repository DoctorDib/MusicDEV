const config = require('../../../config/config');
const boundary = require('./boundary');

const mongo = require('../../mongo');


module.exports = (featuresList, boundaries) => {
    let final = {};


    for (let feature in featuresList) {
        if (featuresList.hasOwnProperty(feature)) {
            if (config.track_features[feature]) {

                if (boundaries) {
                    console.log(1)



                } else {
                    final[feature] = featuresList[feature];
                }
            }
        }
    }

// final[feature] = (boundaries ? boundary(feature, featuresList[feature]) : featuresList[feature]);

    return final;
};