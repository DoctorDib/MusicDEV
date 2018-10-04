const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const dependencies = require('./dependencies');
const passport = require('passport');
const favicon = require('serve-favicon');
const path = require('path');

dependencies.resolve(function(routing){
    const app = SetupExpress();

    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost:27017/musicDEV');

    function SetupExpress(){
        const app = express();

        const Socket = require('./helpers/websocket');
        const server = http.createServer(app);
        const ws = new Socket(server);

        server.listen(8081, function(){
            console.log('Listening on port 8081');
        });

        configureExpress(app);

        // Setup Router/Routing
        const router = require('express-promise-router')();
        routing.setRouting(router);
        app.use(router);
    }

    function configureExpress(app){
        app.use(express.static('client/public'));
        app.use(cookieParser());
        app.set('views', __dirname + '/client/public');
        app.use(favicon(path.join(__dirname, '/client/src/img', 'icon.png')));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(validator());
        app.use(session({
            secret: 'SUPER SECRET',
            resave: true,
            saveInitializes: true,
            saveUninitialized: true,
            store: new MongoStore({mongooseConnection: mongoose.connection}),
        }));
        app.use(flash());
        require('./config/passport')(passport);
        app.use(passport.initialize());
        app.use(passport.session());
    }
});
