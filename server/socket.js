"use strict";
import socketIo from 'socket.io'
import _  from 'underscore'
import ChatController  from './controllers/chat.controller'



module.exports =  function(app){
	global.io = socketIo(app);

	var onlineUsers = {};

	var hashName = {};
	

	function broadcast() {
	    io.sockets.emit("connectNum", Object.keys(hashName).length);
	    io.sockets.emit("users", hashName);
	}

	//提供私有socket
	function privateSocket(toId) {
	    return( _.findWhere(io.sockets.sockets, {id: toId}));

	}

	//返回给当前客户端提示
	function tipToClient(socket,msg) {
	    privateSocket(socket.id).emit('tip', msg);
	}


	io.on('connection', function (socket) {
	    console.log('connection succed!');

	    var refresh_online = function () {
			var n = [];
			for (var i in onlineUsers){
				n.push(i);
			}
			socket.broadcast.emit('online list', n);
			// socket.emit('online list', n);
		}



	    const Chat = new ChatController(socket,onlineUsers)

	 	Chat.createSocket({})

	    socket.on('login',async function(data,fn){
	    	try{
	    		let body = await Chat.loginByToken(data);
	    				await Chat.online();
	    		fn(null,body)
	    	}catch(err){
	    		console.log(err)
	    		fn({
	    			code:0,
	    			message:'错误'
	    		})
	    	}
	    })


	    socket.on('sendMessage',async function(data,fn){
	    	try{
	    		let body = await Chat.sendMessage(data);
	    		fn(null,body)
	    	}catch(err){
	    		console.log(err)
	    		fn({
	    			code:0,
	    			message:'错误'
	    		})
	    	}
	    })

	    socket.on('getHistoryMessages',async function(data,fn){
	    	try{
	    		let body = await Chat.getHistoryMessages(data);
	    		fn(null,body)
	    	}catch(err){
	    		console.log(err)
	    		fn({
	    			code:0,
	    			message:'错误'
	    		})
	    	}
	    })

	    socket.on('getConversationList',async function(fn){
	    	try{
	    		let body = await Chat.getConversationList();
	    		fn(null,body)
	    	}catch(err){
	    		console.log(err)
	    		fn({
	    			code:0,
	    			message:'错误'
	    		})
	    	}
	    })


	    socket.on('clearUnreadCount',async function(data,fn){
	    	try{
	    		let body = await Chat.clearUnreadCount(data);
	    		fn&&fn(null,body)
	    	}catch(err){
	    		console.log(err)
	    		fn&&fn({
	    			code:0,
	    			message:'错误'
	    		})
	    	}
	    })












	    socket.on('setName', function (data) {
	    	console.log(data)
	        var name = data;
	        if (hashName[name]) {//若已经存在则重新注册
	            tipToClient(socket,"tip: " + name + " 已注册！");
	            return;
	        }
	        tipToClient(socket,"tip: " + name + " 注册成功");
	        hashName[name] = socket.id;
	        console.log(hashName);
	        broadcast();
	    });

		socket.on('client message', function (data) {
	    	//广播给除自己以外的客户端
			socket.emit('server message', data);
	    });
	    
	    socket.on('disconnect', function () {
	        console.log('connection is disconnect!');

	        Chat.offline();
	        
	        Chat.removeSocket({})
	    });
	});
}

