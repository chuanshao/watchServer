/**
 * Created by DELL on 2017/4/11.
 */
var Room = require('./room');
var roomService = null;
module.exports.getRoomService = function(app) {
    if(!roomService){
        roomService = new Handler(app);
    }
    return roomService;
}

var Handler = function(app)
{
    this.app = app;
    this.channelService = app.get('channelService');
    this.rooms = {};
}
var pro = Handler.prototype;

pro.createRoom = function(name){
    if(this.rooms[name]) {
        return this.rooms[name];
    }
    var c = this.channelService.createChannel(name);
    var room = new Room(c);
    this.rooms[name] = room;
    return room;
}
pro.getRoom = function(roomId){
    return this.rooms[name];
}
pro.destroyRoom = function (name) {
    delete this.rooms[name];
    this.channelService.destroyChannel(name);
}
pro.broadcast = function (stype, route, msg, opts, cb) {
    this.channelService.broadcast(stype, route, msg, opts, cb);
}