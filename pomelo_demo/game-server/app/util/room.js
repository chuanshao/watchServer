/**
 * Created by DELL on 2017/4/11.
 */
var GameManager = require('../rule/tsKing/gameManager');
module.exports = function( setting){
    return new RoomHandler( setting);
}
var RoomHandler = function( setting){
    this.gameManager = new GameManager(setting);
}
RoomHandler.prototype.add = function(uid , sid , cb){
    var self = this;
    this.gameManager.playerEnterRoom(uid , function (err , res) {
        if(err){
            cb(err , null);
        }else{
            var start = res.isStarted;
            var playerPos = self.gameManager.getPlayerPosData();
            var playerPosWithPokes = self.gameManager.getPlayerPokeAnPosData(uid);
            var returnData = {};
            returnData["isStart"] = start;
            if(err){
                console.log(err);
                cb( err, null);
            }else{
                if(start){//游戏已经开始
                    returnData["playerPosWithPokes"] = playerPosWithPokes;
                }else{
                    returnData["playerPos"] = playerPos;
                }
                cb( null, returnData);
            }
        }
    });
}
RoomHandler.prototype.leave = function(uid , sid){
    this.gameManager.playerLeave(uid);
}
RoomHandler.prototype.getMembers = function(){
}
RoomHandler.prototype.getMember = function(uid){
}
RoomHandler.prototype.destroy = function () {

}
RoomHandler.prototype.pushMessage = function (route, msg, opts, cb) {
}
