var userDao = require('../../../dao/userDao');
var Code = require('../../../../../shared/code');
var async = require('async');
module.exports = function(app) {
  return new Handler(app);
};
var Handler = function(app) {
  this.app = app;
};




/**
 * New user Login
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg , session , nex)
{
	var token = msg.token , self = this;
	if(!token){
		next(new Error('invalid entry request: empty token'), {code: Code.FAIL});
		return;
	}
	var uid;
	async.waterfall([
		function(cb){
			self.app.rpc.auth.authRemote.auth(session , token , cb);//先检测当前用户的登陆状态
		},
		function (code, user , cb) {
			if(code != Code.OK){
				next(null, {code: code});
				return;
			}
			if(!user) {
				next(null, {code: Code.ENTRY.FA_USER_NOT_EXIST});
				return;
			}
			uid = user.id;
			userDao.getUserInfoById(user.id, cb);
		},
		function (res , cb) {
			session.bind(uid, cb);
		}
	])
}
/**
 * Publish route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.publish = function(msg, session, next) {
	var result = {
		topic: 'publish',
		payload: JSON.stringify({code: 200, msg: 'publish message is ok.'})
	};
  next(null, result);
};

/**
 * Subscribe route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.subscribe = function(msg, session, next) {
	var result = {
		topic: 'subscribe',
		payload: JSON.stringify({code: Code.OK, msg: 'subscribe message is ok.'})
	};
  next(null, result);
};
