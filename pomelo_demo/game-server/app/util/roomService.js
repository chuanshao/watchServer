/**
 * Created by DELL on 2017/4/11.
 */
var roomService = null;
var Room = require('./room');
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
    var gameService = this.app.get("gameService");
    var roomName = "" + this.roomStart;
    if(this.roomStart > 999999){
        roomName = "" + this.roomPool.pop();
    }
    var c = channelService.createChannel(roomName);
    var game = gameService.createGame(roomName , setting);
    var room = new Room(setting , game , c);
    this.rooms[roomName] = room;
    this.roomStart ++;
    cb(null , {"roomId":roomName});
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
