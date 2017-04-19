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
    uid = session.uid;
    channelName = msg.channelName;
    msg.content = setContent(msg.content);
    content = { uid: uid, content: msg.content, kind: msg.kind || 0, from: msg.from};
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
