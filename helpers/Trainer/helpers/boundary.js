const positiveMap = {
    key: 11,
    tempo: 1000,
};

const negativeMap = {
    loudness: 11,
};

function clampPositive(field, value){
    return ((value / positiveMap[field]) / 2) + 0.5;
}

function clampNegative(field, value){
    return (Math.abs(value) / negativeMap[field]) / 2;
}

module.exports = function(field, val) {
    if(field === "key" || field === "tempo"){
        return clampPositive(field, val);
    } else if(field === "loudness") {
        return clampNegative(field, val);
    } else {
        return "error";
    }
};