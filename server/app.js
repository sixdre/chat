"use strict";
import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import fs from 'fs'
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import bodyParser from 'body-parser'
import connectMongo from 'connect-mongo'
import config from './config/config'
import db from './config/db.js';
import retMiddleWare from './middleware/ret'
import router from './router'

const app = global.app = express();



app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', config.allowOrigin);
    res.header('Access-Control-Allow-Headers', 'X_Requested_With,Content-Type, Content-Length, Authorization, Accept, X-Requested-With , x-access-token');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

const mongoStroe = connectMongo(session);
app.use(cookieParser());

//设置session
app.use(session({
    secret: config.session.secret,
    name: config.session.name, //设置 cookie 中，保存 session 的字段名称，默认为 connect.sid 
    cookie: config.session.cookie, //有效时间
    saveUninitialized: false,
    resave: true,
    store: new mongoStroe({
        url: config.mongodb,
        collection: 'sessions'
    })
}));



// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(retMiddleWare());
//routes 
router(app);







// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        // res.status(err.status || 500);
        // res.render('error', {
        // 	message: err.message,
        // 	error: err
        // });
        res.status(err.status || 500).json({
            code: err.status || 500,
            message: err.message
        });
    });
} else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500).json({
            code: err.status || 500,
            message: err.message
        });
    });
}



module.exports = app;