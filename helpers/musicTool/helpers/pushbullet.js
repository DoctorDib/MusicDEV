const config = require('../../../config/config');

let PushBullet = require('pushbullet');
let pusher = new PushBullet(config.pushBullet.api_token);

module.exports = {
    send: (data) => {
        pusher.devices((error, response) => {
            if(error){
                console.log(error)
                console.warn("No devices found... Continuing")
                return false;
            }
            pusher.note(response.devices[0].iden, data.title, data.body, (error, response)=>{
                
            });
        });
    }
};