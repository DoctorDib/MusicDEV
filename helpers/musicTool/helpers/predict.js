function check (outcome, callback) {
    let high = -1000000, highLabel;

    for (let index in outcome) {
        if(outcome.hasOwnProperty(index)){
            let tmpOut = outcome[index];
            //tmpOut = Number(Number.parseFloat(tmpOut).toFixed(20)); //TODO - MAKE SURE THIS IS THE CORRECT METHOD?

            if (tmpOut > high) {
                high = tmpOut;
                highLabel = index;
            }
        }
    }

    if (highLabel === undefined){
        console.log("EERRRRRROORRRR:")
        console.log(outcome)
        process.exit(1)
    }
    callback(highLabel);
}

module.exports = function (net, data, callback) {
    let features = data.features ? data.features : data;
    let outcome = net.run(features);

    if (outcome) {
        check(outcome, (resp)=>{
            callback(resp)
        });
    }
};