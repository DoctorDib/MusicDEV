const config = require('../../../config/config');
const boundary = require('./boundary');

module.exports = (featuresList, boundaries) => {
    let final = {};

    for (let feature in featuresList) {
        if (featuresList.hasOwnProperty(feature)) {
            if (config.track_features[feature]) {
                final[feature] = (boundaries ? boundary(feature, featuresList[feature]) : featuresList[feature]);
            }
        }
    }

    return final;
};