function check(outcome, callback) {
    let high = 0, highLabel;

    for (index in outcome) {
        let tmpOut = outcome[index];
        if (tmpOut > high) {
            high = tmpOut;
            highLabel = index;
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
    console.log(data)
    let outcome = net.run(data);
<<<<<<< HEAD
    
=======
    console.log(outcome)
>>>>>>> d6c8f9d... New methods added
    check(outcome, (resp)=>{
        callback(resp)
    });
}