"use strict";
//后台管理路由
import express  from 'express' 
import UserCtrl from '../controllers/user.controller'
import Auth from '../middleware/auth'
import upload from '../middleware/upload'
const router = express.Router();

router.del = router.delete;

//登陆
router.post('/login',UserCtrl.login);
//前台注册
router.post('/regist',UserCtrl.regist);
//搜索用户
router.get('/users/search', UserCtrl.serachUser);



export default router;