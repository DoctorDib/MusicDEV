const secret = require('../../secretKeys.json');

let PushBullet = require('pushbullet');
let pusher = new PushBullet(secret.pushBullet.api_token);

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
}