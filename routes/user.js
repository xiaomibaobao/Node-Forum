var express = require('express');
var util = require('../util');
var auth = require('../middle');
var router = express.Router();
//注册页面
router.get('/reg',auth.checkNotLogin, function(req, res) {
  res.render('user/reg',{title:'注册'});
});
//提交注册表单
router.post('/reg',auth.checkNotLogin,function(req,res){
  var user = req.body;
  if(user.password != user.repassword){
    //向session中写入一个消息 类型是error
     req.flash('error','密码和重复密码不一致');
     //req.flash('error');//一旦读取之后就立即消失
     return res.redirect('back');
  }
  //1. 对用户密码进行加密
  //2. 得到头像
  user.password = util.md5(user.password);
  user.avatar = "https://secure.gravatar.com/avatar/"+util.md5(user.email)+"?s=25";
  //向数据库保存用户
  Model('User').create(user,function(err,doc){
     if(err){
       req.flash('error','注册失败');
       return res.redirect('back');
     }else{
       //实现登陆 如果此客户端在服务器端的session中有user属性的话就表示登陆状态
       req.session.user = doc;
       req.flash('success','注册成功');
       return res.redirect('/');
     }
  });
});
//登录页面
router.get('/login',auth.checkNotLogin, function(req, res) {
  res.render('user/login',{title:'登录'});
});

router.post('/login',auth.checkNotLogin, function(req, res) {
  var user = req.body;
  user.password = util.md5(user.password);
  Model('User').findOne(user,function(err,doc){
    if(err){
      req.flash('error','登陆失败');
      return res.redirect('back');
    }else{
      if(doc){
        req.session.user = doc;
        req.flash('success','登陆成功');
        return res.redirect('/');
      }else{
        req.flash('error','登陆失败');
        return res.redirect('/user/reg');
      }
    }
  });
});

router.get('/logout',auth.checkLogin, function(req, res) {
  req.session.user = null;
  req.flash('success','退出成功');
  return res.redirect('/user/login');
});


module.exports = router;
