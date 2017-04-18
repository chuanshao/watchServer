/**
 * Created by DELL on 2017/3/15.
 */
module.exports = function(app)
{
    return new RoomRemote(app);
}

var RoomRemote = function(app)
{
    this.app = app;
    this.__gameService__ = app.get('gameService');
}
var gamePro = RoomRemote.prototype;
gamePro.add = function(uid , gameId , cb){

}
gamePro.createGame = function(uid , setting , cb){

}
gamePro.leave = function(uid , gameId , cb){

}
gamePro.ready = function(uid , gameId , cb){

}
gamePro.sendPokes = function(uid , gameId , pokes , cb){

}