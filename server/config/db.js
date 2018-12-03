"use strict";
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import config from './config.js'


mongoose.connect(config.mongodb,{  
    server: {
	    auto_reconnect: true	//自动重新连接
	},
	useMongoClient: true
});
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.once('open' ,() => {
	console.log('连接数据库成功')
})

db.on('error', function(error) {
    console.error('连接错误：请检查是否开启了数据库: ' + error);
    mongoose.disconnect();
});

db.on('close', function() {
    console.log('数据库断开，重新连接数据库');
    mongoose.connect(config.mongodb, {server:{auto_reconnect:true}});
});

export default db;