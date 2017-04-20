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
    return new GameHandler(app, app.get('gameSevice'));
};

var GameHandler = function(app, gameSevice) {
    this.app = app;
    this.gameSevice = gameSevice;
};
function setContent(str) {
    str = str.replace(/<\/?[^>]*>/g,'');
    str = str.replace(/[ | ]*\n/g,'\n');
    return str.replace(/\n[\s| | ]*\r/g,'\n');
}
GameHandler.prototype.createGame = function (msg , session , next) {
    var uid = session.uid;
    var roomName = "100000";
    async.parallel(
        [function (callback) {
            app.rpc.chat.chatRemote.add(uid, roomName, function(err , res){
                callback(err , res);
            });
         },
        function (callback) {
            this.gameSevice.createGame(uid, roomName, function(err , res){
                callback(err , res);
            });
        }
    ],function (err , res) {
        if(err){
            next(err , null);
        }else{
            next(null , res);
        }
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

