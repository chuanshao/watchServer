/**
 * Created by DELL on 2017/4/11.
 */
var Room = require('./room');
var roomService = null;
var dispatcher = require('./dispatcher');
var Code = require('../../../shared/code');
var async = require('async');
module.exports = function(app) {
        return new Handler(app);
}

var Handler = function(app)
{
    this.app = app;
    this.rooms = {};
    this.roomStart = 100000;
    this.roomPool = [];
}
var pro = Handler.prototype;

pro.createRoom = function(uid , setting , cb){
    var channelService = this.app.get("channelService");
    var roomName = "" + this.roomStart;
    if(this.roomStart > 999999){
        roomName = "" + this.roomPool.pop();
    }
    var c = channelService.createChannel(roomName);
    var room = new Room(setting);
    this.rooms[roomName] = room;
    this.roomStart ++;
    cb(null , {"roomId":roomName});
}
pro.enterRoom = function(uid , roomName , cb){
    var channelService = this.app.get("channelService");
    var room = this.getRoom(roomName);
    var channel = channelService.getChannel("roomName" , false);
    var sid = getSidByUid(uid , this.app);
    if(!room || !channel){
        cb(Code.ROOM.ROOM_IS_NOT_EXIT , null);
    }else{
        room.add(uid , sid , function (err , res) {
            if(err){
                cb(err , null);
            }else{
                channel.add(uid , sid);
                channel.pushMessage("newPlayerEnter" , {"123" : 111} , function (err, res) {
                    console.log("pushMessage/........................");
                });
                cb(null , res);
            }
        });
    }
}
pro.getRoom = function(roomId){
    return this.rooms[roomId];
}
pro.destroyRoom = function (name) {
    var channelService = this.app.get("channelService");
    delete this.rooms[name];
    channelService.destroyChannel(name);
}
pro.broadcast = function (stype, route, msg, opts, cb) {
    var channelService = this.app.get("channelService");
    channelService.broadcast(stype, route, msg, opts, cb);
}
var getSidByUid = function(uid, app) {
    var connector = dispatcher.dispatch(uid, app.getServersByType('connector'));
    if(connector) {
        return connector.id;
    }
    return null;
};