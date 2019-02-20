const positiveMap = {
    key: 11,
    tempo: 1000,
};

const negativeMap = {
    loudness: 11,
};

function clampPositive(field, value){
    return Number((((value / positiveMap[field]) / 2) + 0.5).toFixed(5));
}

function clampNegative(field, value){
    return Number(((Math.abs(value) / negativeMap[field]) / 2).toFixed(5));
}

module.exports = function(field, val) {
    if(field === "key" || field === "tempo"){
        return clampPositive(field, val);
    } else if(field === "loudness") {
        return clampNegative(field, val);
    } else {
        return val;
    }
};