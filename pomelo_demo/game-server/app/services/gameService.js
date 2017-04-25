/**
 * Created by DELL on 2017/4/17.
 */
var Game = require('./../rule/tsKing/gamblingParty');
var Code = require('../../../shared/code');
module.exports = function(app) {
    return new Handler(app);
}

var Handler = function(app)
{
    this.app = app;
    this.games = {};
}
var pro = Handler.prototype;

pro.getGame = function(gameId){
    return this.games[gameId];
}
pro.destroy = function(gameId){
    delete this.games[gameId];
}
pro.createGame = function(gameId , setting){
    if(this.games[gameId]){
        return this.games[gameId];
    }
    var game = new Game(setting , this);
    this.games[id] = game;
    return game;
}
pro.addGame = function(gameId , uid , cb){
    var game = this.games[gameId];
    if(!game){
        cb(Code.GAME.ROOM_IS_NOT_EXIT);
        return;
    }
    game.add(uid , cb);
}