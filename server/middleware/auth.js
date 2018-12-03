"use strict";
//用户操作验证
import jwt  from  "jsonwebtoken"
import config from '../config/config'

const secret = config.secret;

//数据模型
class Auth {
	setToken(data){
	    let token = jwt.sign(data, secret, {
	      	expiresIn: '24h' 	//24h
	    })
	    return token;
	}

	//获取登录用户的信息
	getLoginUserInfo(req,res,next){
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
		if(!token){
			req.userInfo = null;
			return next()
		}
		try{
			var decoded = jwt.decode(token, secret);
			req.userInfo = decoded;
			return next()
		}catch(err){
			console.log('token 解析失败,可能是token过期')
			return next()
		}
		
	}
	
	checkToken(req,res,next){
	 	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	    if(token) {//存在token，解析token
	      	jwt.verify(token, secret , function(err,decoded) {
		        if(err) {
		            // 解析失败直接返回失败警告
		          	return res.status(401).json({success:false,msg:'token验证失败',err})
		        }else {
		            //解析成功加入请求信息，继续调用后面方法
		          	req.userInfo = decoded;
		          	next()
		        }
	      	})
	    }else {
	      	return res.status(401).json({success:false,msg:"token验证失败"})
	    }
	}
	

}

export default new Auth();