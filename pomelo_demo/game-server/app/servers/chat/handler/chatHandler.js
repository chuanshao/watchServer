/**
 * Created by DELL on 2017/4/19.
 */
var Code = require('../../../../../shared/code');
module.exports = function(app) {
    return new ChannelHandler(app, app.get('chatService'));
};

var ChannelHandler = function(app, chatService) {
    this.app = app;
    this.chatService = chatService;
};
function setContent(str) {
    str = str.replace(/<\/?[^>]*>/g,'');
    str = str.replace(/[ | ]*\n/g,'\n');
    return str.replace(/\n[\s| | ]*\r/g,'\n');
}
ChannelHandler.prototype.send = function (msg , session , next) {
    var channelName , uid , content , code;
    uid = msg.uid;
    channelName = msg.channelName;
    msg.content = setContent(msg.content);
    content = { uid: uid, content: msg.content};
    this.chatService.pushMessageByChannel(channelName, content, function(err, res) {
        if(err) {
            code = Code.FAIL;
        } else if(res){
            code = res;
        } else {
            code = Code.OK;
        }
        next(null, {code: code});
    });
}

ChannelHandler.prototype.add = function (msg , session , next) {
    var uid = msg["userId"];
    var roomName = msg["roomName"];
   this.chatService.add(uid , roomName);
    next(null , {"success":true});
}