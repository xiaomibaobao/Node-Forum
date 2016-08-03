## 一个基于Node.Js 、MongoDB、Bootstrap的BBS论坛。
+ 我独立开发的一个内部论坛最初版本，后续版本已经上线并稳定运行。
+ 有完整的路由限制，用户操作限制，搜索，PV查看，用户头像等。
+ 性能良好，最初运行在树莓派上（型号3B，系统Liunx-Debian），20余人同时在线稳定运行。
+ 后续优化可能有。
+ [联系我](https://xiaomibaobao.github.io/html/CONTACT.html)

## 安装
```javascript
npm install -g express-generator
npm install
set DEBUG=SmartisanBBS:* & npm run start(或者手动运行bin目录下的www.js即可)
```
+然后在你本地的Mongodb数据库中启动数据库（27017），[MongoDB简单教程](https://xiaomibaobao.github.io/html/Node.js/MongoDB.html)；
+在浏览器访问 `http://localhost:3000` 就成功了

## gitignore
```javascript
node_modules
lib
.idea
```

