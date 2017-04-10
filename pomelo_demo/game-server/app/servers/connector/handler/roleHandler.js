/**
 * Created by DELL on 2017/3/17.
 */
var userDao = require('../../../dao/userDao');
var Code = require('../../../../../shared/code');
var tokenService = require('../../../../../shared/token');

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};
/**
 * New client entry.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.login = function(msg, session, next) {
    var account = msg["account"];
    var self = this;
    userDao.getUserInfo(account , function(err , res){
        if(err){
            next(null ,{code:err});
        }else{
            afterLogin(self.app , msg , session , res , next);
        }
    });
};
/*
 * Create New User
 *
 * */
Handler.prototype.createUser = function(msg , session , next){
    var self = this;
    userDao.createUser("jichang9527" , "huangge9527" , function(err , res){
        if(err){
            next(null ,{code:err});
        }else{
            afterLogin(self.app , msg , session , res , next);
        }
    });
}
///登录完成之后
var afterLogin = function (app , msg , session , user , next) {
    async.waterfall([
        function(cb)
        {
            session.bind(user.id , cb);
        },
        function(cb)
        {
            session.set("account" , user.account);
            session.set("username" , user.nickname);
            session.set("user_id" , user.user_id);
            session.on('closed', onUserLeave);
            session.pushAll(cb);
        }
    ] , function(err){
        if(err) {
            next(null, {code: Code.FAIL});
            return;
        }
        var token = app.rpc.auth.authRemote.createToken(user.id , Date.now());
        next(null , {code : Code.OK , user:user ,token:token});
    });
}

var onUserLeave = function(session, reason)
{

}