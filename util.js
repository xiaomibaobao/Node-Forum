module.exports = {
    md5:function(str){
        //使用crypto模块，创建md5哈希算法，指定要加密的字符串，最后16进制输出 sha1
        return  require('crypto').createHash('md5').update(str).digest('hex')
    }
}