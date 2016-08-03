var express = require('express');
var router = express.Router();
var auth = require('../middle');
var async = require('async');
var markdown = require('markdown').markdown;
//显示所有的文章列表 article.user
// query传参数  pageNum 当前的页数 pageSize 每页的条数
router.get('/list',function(req,res){
    //当form表单以get方式发送到后台，会将表单序列化成查询字符串格式并追加在url后面
    var keyword = req.query.keyword;//关键字
    var orderBy = req.query.orderBy||'createAt';//排序字段
    var order = req.query.order?parseInt(req.query.order):-1;//排序顺序
    var pageNum = req.query.pageNum?parseInt(req.query.pageNum):1;//如果给了页数取给定的参数，如果没有给，取默认值
    var pageSize = req.query.pageSize?parseInt(req.query.pageSize):5;//如果给了条数，取条数，如果没有给则取默认条数2
    var query = {};
    //如果说有关键字的话
    if(keyword){
        //创建一个正则表达式
        var regex = new RegExp(keyword,'i');
        //拼出一个查询条件
        query['$or'] = [{title:regex},{content:regex}];
    }
    var orderObj = {};
    if(orderBy){
        orderObj[orderBy] = order;
    }
    //skip是指跳过条数 limit最大取多少条
    // 2 2 2    3 2 4
    Model('Article').find(query).count(function(err,count){
        Model('Article').find(query).sort(orderObj).skip(pageSize*(pageNum - 1)).limit(pageSize).populate('user').exec(function(err,docs){
            docs.forEach(function(doc){
                doc.content = markdown.toHTML(doc.content);
            });
            res.render('article/list',{title:'文章列表',
                articles:docs,//当前记录
                pageNum:pageNum,//当前页数
                orderBy:orderBy,
                order:order,
                pageSize:pageSize,//每页条数
                totalPage:Math.ceil(count/pageSize),//算出总页数
                keyword:keyword //向模板继续传递keyword
            });
        });
    });
});


router.get('/add',auth.checkLogin,function(req,res){
    res.render('article/add',{title:'发表文章',article:{}});
});

router.post('/add',auth.checkLogin,function(req,res){
   var article = req.body;//得到请求体
   var _id = article._id;//先得到文章的ID
    console.log(_id);
   if(_id){//修改
       Model('Article').update(//使用修改器修改对应文章的标题和内容
           {_id:_id},
           {$set:{title:article.title,content:article.content}},
       function(err,result){
           if(err){
               req.flash('error','修改文章失败');
               res.redirect('back');
           }else{
               req.flash('success','修改文章成功');
               //如果前台是通过ajax请求此路由，那么并不能跳转
               res.redirect('/article/detail/'+_id);
           }
       });
   }else{//新增加
       //从session中获取当前会话用户的ID
       article.user = req.session.user._id;
       //因为_id有值，但是是空字符串，所以转成ObjectId失败。所以要删除此属性，让数据库自动生成新的_id
       delete article._id;
       article.createAt = Date.now();
       Model('Article').create(article,function(err,doc){
           if(err){
               console.log(err);
               req.flash('error','发表文章失败');
               res.redirect('back');
           }else{
               req.flash('success','发表文章成功');
               res.redirect('/');
           }
       })
   }
});

router.get('/detail/:_id',function(req,res){
    async.parallel({
        pv:function(cb){
            Model('Article').update({_id:req.params._id},
                {$inc:{pv:1}},
                function(err,result){
                    cb(err,result);
                }
            )
        },
        doc:function(cb){
            Model('Article').findById(req.params._id).populate('comments.user').exec(function(err,doc){
                cb(err,doc);
            });
        }
    },function(err,result){
        res.render('article/detail',{title:'文章详情',article:result.doc});
    })

    /*Model('Article').findById(req.params._id).populate('comments.user').exec(function(err,doc){
        doc.pv = (doc.pv||0) + 1;
        doc.save(function(err,newDoc){
            res.render('article/detail',{title:'文章详情',article:doc});
        });
    })*/
});

router.get('/delete/:_id',function(req,res){
    Model('Article').findById(req.params._id,function(err,doc){
        if(doc){
            console.log(req.session.user._id , doc.user);
            if(req.session.user._id == doc.user){
                Model('Article').remove({_id:req.params._id},function(err,result){
                    res.redirect('/');
                })
            }else{
                req.flash('error','不是你发表的文章，不能删除');
                res.redirect('back');
            }
        }else{
            res.redirect('back');
        }
    })

});
//先得到文章的ID，然后得到文章的详情对象，并跳转到编辑页(复用新增文章模板)
router.get('/edit/:_id',function(req,res){
  //得到文章的ID
  var _id = req.params._id;
  //根据ID查询文章对象，并把此对象赋给模板变量
  Model('Article').findById(_id,function(err,doc){
      res.render('article/add.html',{title:'修改文章',article:doc});
  })
});

router.post('/comment',function(req,res){
    var comment = req.body;// user createAt content
    comment.user = req.session.user._id;//从session得到用户的ID
    Model('Article').update({_id:comment.articleId},{
        $push:{comments:comment}},function(err,newDoc){
            if(err){
                req.flash('error','评论失败');
                res.redirect('back');
            }else{
                req.flash('success','评论成功');
                res.redirect('back');
            }
        }
    );
    /*Model('Article').findById(comment.articleId,function(err,doc){
        doc.comments.push(comment);
        doc.save(function(err,newDoc){
            if(err){
                req.flash('error','评论失败');
                res.redirect('back');
            }else{
                req.flash('success','评论成功');
                res.redirect('back');
            }
        });
    })*/

});


module.exports = router;