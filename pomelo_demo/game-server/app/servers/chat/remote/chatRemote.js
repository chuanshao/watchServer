/**
 * Created by DELL on 2017/4/18.
 */
var utils = require('../../../util/utils');
module.exports = function(app) {
    return new ChatRemote(app, app.get('chatService'));
};

var ChatRemote = function(app, chatService) {
    this.app = app;
    this.chatService = chatService;
};

/**
 *	Add player into channel
 */
ChatRemote.prototype.add = function(uid, channelName, cb) {
    var code = this.chatService.add(uid, channelName);
    utils.invokeCallback(cb);
};

/**
 * leave Channel
 * uid
 * channelName
 */
ChatRemote.prototype.leave =function(uid, channelName, cb){
    this.chatService(uid, channelName);
    cb();
};

/**
 * kick out user
 *
 */
ChatRemote.prototype.kick = function(uid, cb){
    this.chatService.kick(uid);
    cb();
};
