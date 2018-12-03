/*
 * 用户控制器
 */
"use strict";
import _ from 'underscore'
import validator from 'validator'
import jwt  from  "jsonwebtoken"

import config from '../config/config'
import auth from '../middleware/auth'
import UserModel from '../models/user.model'
import {validateUserName} from '../services/user.service'
const tool = require('../utility/tool');

const secret = config.secret;

//数据模型

export default new class UserController{
	//前台用户注册
	async regist(req,res,next){
		let {username,password,email} = req.body;
		try{
			if (validator.isEmpty(username)) {
				throw new Error('用户名不得为空');
			}else if(!validateUserName(username)){
				throw new Error('用户名不合法');
			}else if(validator.isEmpty(password)){
				throw new Error('密码不得为空');
			}else if(validator.isEmpty(email)){
				throw new Error('邮箱不得为空！');
			}else if(!validator.isEmail(email)){
				throw new Error('请输入正确的邮箱！');
			}else if(!validator.isLength(password,{min:3})){
				throw new Error('密码不得小于3位！');
			}
		}catch(err){
			console.log('用户填写参数出错', err.message);
			res.retErrorParams(err.message);
			return;
		}
		
		try{
			let user =await UserModel.findOne({username:username})
			if(user){
				res.retError('用户名已被创建');
				return;
			}
			let newUser=new UserModel({
				username:username,
				password:password,
				email:email
			});
			
			await newUser.save();
			res.retSuccess();

		}catch(err){
			console.log('用户注册失败:' + err);
			return next(err);
		}
		
	}
	
	//前台用户登录
	async login(req,res,next){
		let {username,password} = req.body;
		try{
			if (validator.isEmpty(username)) {
				throw new Error('请输入用户名');
			}else if(validator.isEmpty(password)){
				throw new Error('请输入密码');
			}
		}catch(err){
			console.log('用户填写参数出错', err.message);
			res.retErrorParams(err.message);
			return;
		}  
		  
		try{
			let user = await UserModel.findOne({username:username});
			if(!user){
				return res.retError('该用户没有注册！');
			}
			user.comparePassword(password,function(err, isMatch) {
	            if (err) throw err;
	            if(isMatch){
	            	var token = auth.setToken(JSON.parse(JSON.stringify({
	            		_id:user._id,
	            		username:user.username,
	            		email:user.email,
	            		isAdmin:user.isAdmin
	            	})));
	            	var {exp,iat} = jwt.decode(token, secret);
	            	req.session["User"] = user;
					res.retSuccess({
						token,
						exp,
						iat,
						userInfo:{
							_id:user._id,
							username:user.username,
							avatar:user.avatar
						},
					});
	            }else{
	            	res.retError('密码不正确！')
	            }
	        });

		}catch(err){
			console.log('登录失败:' + err);
			return next(err);
		} 
	}
	
	async serachUser(req,res,next){
		let {username} = req.query;
		try{
			if(!username.length){
				res.retSuccess({
					data:[]
				});
				return;
			}
			let query = {
				username:{
					'$regex': username
				}
			}
			let users = await UserModel.find(query);
			res.retSuccess({
				data:users
			});

		}catch(err){
			return next(err);
		}
	}
}




