/**
 * Created by DELL on 2017/4/19.
 */
/**
 * Created by DELL on 2017/4/19.
 */
var Code = require('../../../../../shared/code');
var async = require('async');
var messageService = require('../../../domain/messageService');
module.exports = function(app) {
    return new GameHandler(app, app.get('gameService'));
};

var GameHandler = function(app, gameService) {
    this.app = app;
    this.gameSevice = gameService;
};
GameHandler.prototype.addGame = function(msg , session , next){
    var uid = session.uid;
    var roomName = 100000;
    var self = this;
    var returnData = {};
    async.parallel([
        function (callback) {
            self.app.rpc.chat.chatRemote.add(null, uid, roomName, function(err , res){
                callback(null , res);
            });
        },
        function (callback) {
            self.gameSevice.addGame(roomName , uid, function (err , res) {
                returnData = res;
                callback(err , res);
            });
        }
    ],function (err , res) {
        if(err){
            next(null , {"code":err});
        }else{
            next(null , returnData);
        }
    });
}
GameHandler.prototype.createGame = function (msg , session , next) {
    var uid = session.uid;
    var roomName = 100000;
    var self = this;
    async.parallel([
        function (callback) {
            self.app.rpc.chat.chatRemote.add(null, uid, roomName, function(err , res){
                callback(null , res);
            });
         },
        function (callback) {
             var setting = {"playerNum":2};
            self.gameSevice.createGame(roomName, setting);
            self.gameSevice.addGame(roomName , uid, function (err , res) {
                callback(err , res);
            });
        }
    ],function (err , res) {
        if(err){
            next(null , {"code":err});
        }else{
            next(null , {"success":""});
        }
    });
}
GameHandler.prototype.ready = function (msg ,session , next) {
    var gameId = 100000;
    var uid = session.uid;
    var game = this.gameSevice.getGame(gameId);
    if(!game){
        next({
            code: Code.GAME.BE_READY_ERROR
        }, null);
        return ;
    }
    game.playerReady(uid , function (err , res) {
        next(err , res);
    });
}
GameHandler.prototype.sendPokes = function(msg , session , next){
    var uid = session.uid;
    var roomName = "10000";
    var pokes = msg.pokes;
    async.series([
        function (callback) {
            this.gameSevice.sendPokes(uid, roomName, pokes, function(err , res){
                next(err , res);
            });
        },
        function(callback){//向其他玩家发消息s
            messageService.pushMessageToPlayer();
        }
    ],function(err , res){

    });
}

GameHandler.prototype.getCurrentStatus = function (msg , session , next) {
    
}
GameHandler.prototype.leave = function (msg , session , next) {
    
}

