const WebSocket = require('ws');
const spotify = require('../helpers/spotify_api.js');

class Socket {
    constructor(server) {
        this.ws = new WebSocket.Server({server});

        /*function sendBack(client, responseData) {
            try {
                console.log(responseData)
                CLIENTS[CLIENTS.indexOf(client)].send(JSON.stringify(responseData));
            } catch (e) {
                console.log("ERRROROR: ", e)
            }
        }*/

        this.ws.on('connection', function (ws) {
            ws.isAlive = true;
            ws.on('pong', heartbeat);

            /*if (CLIENTS.indexOf(ws) == -1) {
                CLIENTS.push(ws);
            }*/

            ws.on('message', function (message) {
                console.log('received: %s', message)
                message = JSON.parse(message);

                switch (message.event) {
                    case 'currentMusic':
                        spotify("grabCurrentMusic", {username: message.data.username}, function (data) {
                            sendBack(ws, {event: 'currentSong', data: data});
                        });
                        break;
                    case 'set_get':
                        spotify('set_get', {
                            access_token: message.data.access_token,
                            username: message.data.username
                        });
                        break;
                    case 'new_user':
                        spotify('new_user', {username: message.data.username});
                        break;
                    case 'ping':
                        CLIENTS[CLIENTS.indexOf(ws)].send("pong")
                        break;
                    case 'analyseTrack':
                        spotify('analyseTrack', {trackURI: message.data.trackURI}, function (response) {
                            sendBack(ws, {event: 'trackFeatures', data: response})
                        });
                        break;
                    case 'login':
                        spotify('login', {url: message.data.url}, function (data) {
                            console.log(data)
                            sendBack(ws, {username: data.username})
                        });
                }
            });
        });

        setInterval(() => {
            this.ws.clients.forEach(clientWS => {
                if(clientWS.isAlive === false) return clientWS.terminate();
                clientWS.isAlive = false;
                clientWS.ping(() => {});
            });
        }, 30000);


        // Setup web sockets
        function heartbeat() {
            this.isAlive = true;
        }
    }

    /*sendBack = (event, value) => {
        this.ws.sendBack(JSON.stringify(responseData));
    };*/
}

module.exports = Socket;
