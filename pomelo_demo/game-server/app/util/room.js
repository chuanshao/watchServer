/**
 * Created by DELL on 2017/4/11.
 */
module.exports = function( setting , game , channel){
    return new RoomHandler( setting , game , channel);
}
var RoomHandler = function(channel , game , setting){
    this.game = game;
    this.channel = channel;
}
RoomHandler.prototype.add = function(uid , sid , cb){
    var self = this;
    this.channel.add(uid , sid);
    this.game.add(uid , function (err , res) {
        if(err){
            cb(err , null);
        }else{
            var start = res.isStarted;
            var playerPos = self.game.getPlayerPosData();
            var playerPosWithPokes = self.game.getPlayerPokeAnPosData(uid);
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
RoomHandler.prototype.sendPokes = function(uid , sid , pokes , cb){
    this.game.sendPokes(uid , pokes , cb);
}
RoomHandler.prototype.leave = function(uid , sid){
    this.game.playerLeave(uid);
    this.channel.leave(uid , sid);
}
RoomHandler.prototype.getMembers = function(){

}
RoomHandler.prototype.getMember = function(uid){

}
RoomHandler.prototype.destroy = function () {
    this.channel.destroy();
    this.game.destroy();
}
RoomHandler.prototype.pushMessage = function (route, msg, opts, cb) {
    this.channel.pushMessage(route , msg , opts , cb);
}
