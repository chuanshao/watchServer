/**
 * Created by DELL on 2017/4/18.
 */
var Code = require('../../../shared/code');
var utils = require('../util/utils');
var dispatcher = require('../util/dispatcher');
var Event = require('../consts/consts').Event;
var ChatService = function(app){
    this.app = app;
    this.uidMap = {};
    this.channelMap = {};
}
module.exports = ChatService;
ChatService.prototype.add = function (uid , channelName) {
    var sid = getSidByUid(uid, this.app);
    console.log("sid......................" + sid);
    if(!sid){
        return Code.Chat.FA_UNKNOW_CONNECTOR;
    }
    if(checkDuplicate(this , uid , channelName)){//当前玩家已经在频道当中
        return Code.OK;
    }
    var channel = this.app.get('channelService').getChannel(channelName, true);
    if(!channel) {
        return Code.Chat.FA_CHANNEL_CREATE;
    }
    channel.add(uid, sid);
    addRecord(this , uid , sid , channelName);
    return Code.OK;
}

ChatService.prototype.leave = function(uid , channelName){
    var record = this.uidMap[uid];
    var channel = this.app.get('channelService').getChannel(channelName, true);
    if(channel) {
        channel.leave(uid, record.sid);
    }
    removeRecord(this, uid, channelName);
}

ChatService.prototype.kick = function(uid) {
    var channelNames = this.channelMap[uid];
    var record = this.uidMap[uid];

    if(channelNames && record) {
        // remove user from channels
        var channel;
        for(var name in channelNames) {
            channel = this.app.get('channelService').getChannel(name);
            if(channel) {
                channel.leave(uid, record.sid);
            }
        }
    }
    clearRecords(this, uid);
};

ChatService.prototype.pushMessageByChannel = function(channelName , msg , cb){
    var channel = this.app.get('channelService').getChannel(channelName);
    if(!channel) {
        cb(new Error('channel ' + channelName + ' dose not exist'));
        return;
    }

    channel.pushMessage(Event.chat, msg, cb);
}
/**
 * Cehck whether the user has already in the channel
 */
var checkDuplicate = function(service, uid, channelName) {
    return !!service.channelMap[uid] && !!service.channelMap[uid][channelName];
};
/**
 * Get the connector server id assosiated with the uid
 */
var getSidByUid = function(uid, app) {
    var connector = dispatcher.dispatch(uid, app.getServersByType('connector'));
    if(connector) {
        return connector.id;
    }
    return null;
};


var addRecord = function(service , uid ,sid, channelName){
    var record = {uid: uid, sid: sid};
    service.uidMap[uid] = record;
    var item = service.channelMap[uid];
    if(!item) {
        item = service.channelMap[uid] = {};
    }
    item[channelName] = 1;
}
var removeRecord = function(service, uid, channelName){
    delete service.channelMap[uid][channelName];
    if(utils.size(service.channelMap[uid])) {
        return;
    }
    clearRecords(service, uid);
}

var clearRecords = function(service, uid) {
    delete service.channelMap[uid];

    var record = service.uidMap[uid];
    if(!record) {
        return;
    }

    delete service.uidMap[uid];
};