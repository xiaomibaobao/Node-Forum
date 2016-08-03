var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var settings = require('../settings');
mongoose.connect(settings.url);
//用户model
mongoose.model('User',new mongoose.Schema({
    username:{type:String,isRequired:true},//用户名
    password:{type:String,isRequired:true},//密码
    email:{type:String,isRequired:true},//邮箱
    avatar:{type:String}//头像
}));
//文章的model
mongoose.model('Article',new mongoose.Schema({
    title:{type:String,isRequired:true},    //标题
    content:{type:String,isRequired:true},  //内容
    createAt:{type:Date,default:Date.now()},//创建时间
    pv:{type:Number,default:0},//page view浏览量 每访问一次加1
    comments:[{//评论的一个数组
        user:{type:ObjectId,ref:'User'},//评论人
        content:{type:String},//评论的内容
        createAt:{type:Date,default:Date.now()}//评论的时间
    }],
    user:{type:ObjectId,ref:'User'}         //作者
}));
//在程序的任何地方都可以调用此方法
global.Model = function(modelName){
    return mongoose.model(modelName);
};