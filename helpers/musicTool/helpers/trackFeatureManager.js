const config = require('../../../config/config');
const boundary = require('./boundary');

const async = require('async');

module.exports = (featuresList, boundaries, callback, counter) => {
    let final = {}, index = 0;

    return async.eachOfSeries(featuresList, (feature, featureKey, featureCallback) => {
        index ++;

        if (config.track_features[featureKey]) {
            if (boundaries) {
                final[featureKey] = boundary(feature, featuresList[featureKey], counter[featureKey]);
            } else {
                final[featureKey] = featuresList[featureKey];
            }
        }

        if (index >= Object.keys(featuresList).length) {
            callback(final);
        } else {
            featureCallback();
        }
    });
};