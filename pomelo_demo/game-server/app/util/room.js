/**
 * Created by DELL on 2017/4/11.
 */
var GameManager = require('../rule/tsKing/gameManager');
module.exports = function(channel , setting){
    return new RoomHandler(channel , setting);
}
var RoomHandler = function(channel , setting){
    this.channel = channel;
    this.gameManager = new GameManager(setting);
}
RoomHandler.prototype.add = function(uid , sid , cb){
    this.channel.add (uid , sid);
    this.gameManager.playerEnterRoom(uid , cb);
}
RoomHandler.prototype.leave = function(uid , sid){
    this.channel.leave(uid , sid);
    this.gameManager.playerLeave(uid);
}
RoomHandler.prototype.getMembers = function(){
    return this.channel.getMembers();
}
RoomHandler.prototype.getMember = function(uid){
    return this.channel.getMember(uid);
}
RoomHandler.prototype.destroy = function () {

}
RoomHandler.prototype.pushMessage = function (route, msg, opts, cb) {
    this.channel.pushMessage(route , msg , opts , cb);
}
