module.export = {
    config: {
        inputSize: 100,
            inputRange: 100,
            hiddenSizes: [500, 500, 500, 500, 500, 500],
            outputSize: 100,
            learningRate: 0.01,
            decayRate: 0.999,
            binaryThresh: 0.5,     // ¯\_(ツ)_/¯
            hiddenLayers: [500, 500, 500, 500, 500, 500],     // array of ints for the sizes of the hidden layers in the network
            activation: 'sigmoid'  // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh']
    },
    train: {
        // Defaults values --> expected validation
        iterations: 50000000,    // the maximum times to iterate the training data --> number greater than 0
            errorThresh: 0.005,   // the acceptable error percentage from training data --> number between 0 and 1
            logPeriod: 25,        // iterations between logging out --> number greater than 0
            learningRate: 0.01,    // scales with delta to effect training rate --> number between 0 and 1
            momentum: 0.1,        // scales with next layer's change value --> number between 0 and 1
            callback: null,       // a periodic call back that can be triggered while training --> null or function
            callbackPeriod: 10,   // the number of iterations through the training data between callback calls --> number greater than 0
            timeout: Infinity,     // the max number of milliseconds to train for --> number greater than 0
            reinforce: true,
            keepNetworkIntact:true
    }
}
