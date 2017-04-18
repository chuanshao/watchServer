/**
 * Created by DELL on 2017/3/27.
 */
var Code = require('../../../../../shared/code');
var async = require('async');
module.exports = function(app)
{
    return new Handler(app);
}
var Handler = function(app)
{
    this.app = app;
    this.roomService = this.app.get("roomService");
}

var pro = Handler.prototype;

pro.enterRoom = function(msg , session , next)
{
    var roomId = msg.roomId;
    var userId = msg.userId;
    if(!roomId || !userId){
        next(Code.FAIL , null);
        return;
    }
    var sid = getSidByUid(userId , this.app);
    var room = this.roomService.getRoom(roomId);
    if(!room){
        next(Code.ROOM.ROOM_IS_NOT_EXIT , null);
        return;
    }
    room.add(roomId , sid , function (err , res) {
        if(err){
            next(err, null);
        }else{
            next(null, res);
        }
    });
}

pro.createRoom = function(msg , session , next)
{
    var userId = msg.userId;
    var setting = msg.setting;
    this.roomService.createRoom(userId , setting , function (err , res) {
        if(err){
            next(err , null);
        }else{
            next(null , res);
        }
    });
}
pro.sendPokes = function(msg , session , next){
    var room = this.roomService.getRoom(msg.roomId);
    var pokes = msg.pokes;
    var uid = msg.userId;
    var sid = getSidByUid(uid , this.app);
    if(!room){
        next(Code.ROOM.ROOM_IS_NOT_EXIT , null);
        return;
    }
    room.sendPokes(uid, sid , pokes , function (err , res) {
        next(err , res);
    });
}

pro.destroyRoom = function(msg , session , next)
{
    var room = this.roomService.getRoom(msg.roomId);
    if(room){
        room.destroy();
    }
}

var getSidByUid = function(uid, app) {
    var connector = dispatcher.dispatch(uid, app.getServersByType('connector'));
    if(connector) {
        return connector.id;
    }
    return null;
};

