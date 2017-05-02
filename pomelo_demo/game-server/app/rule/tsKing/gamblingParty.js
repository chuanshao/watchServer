/**
 * Created by DELL on 2017/4/7.
 * 牌局,数据处理中心
 */
var Code = require('../../../../shared/code');
var ass = require('../../util/ass');
var CardGame = require('./cardGame');
var Event = require('../../consts/consts').Event;
var messageService = require('../../domain/messageService');
var utils = require('../../util/utils');
var TSWGameStatus = require('../../consts/consts').TSWGameStatus;
module.exports = function(setting , service)
{
    return new Handler(setting , service);
}
var Handler = function(setting , service){
    this.__gameService__ = service;
    this.currentIndex = 0;//当前进行到第几局
    this.isStarted = false;//是否开始   开始就不能结束了
    this.currentCardGame = null;
    this.playerNum =setting.playerNum;
    this.setting = setting;
    this.readyPlayer = [];//已经准备的玩家
    this.posWithPlayer = [];
}
var pro = Handler.prototype;
/**
 * 获取当前的游戏
 * @returns {null|Game}
 */
pro.getCurrentGame = function(){
    return this.currentCardGame;
}
/**
 * 加入游戏
 * @param uid
 * @param pos
 */
pro.add = function(uid  , cb){
    var player = this._getPlayer(uid);
    var self = this;
    var returnData = {};
    if(self.isStarted){
        if(player){//玩家重新进入房间,返回玩家所需要的所有信息
            cb(null , self._getAllInfo());
            self._pushMessageToOther(uid , Event.playerEnter , {"userId" : uid , "pos" : self._getPlayerPos(uid)});
        }else{
            cb(Code.GAME.ROOM_IS_NOT_EXIT , null); //房间不存在
        }
    }else{
        if(!player){
            var emptyPos = self._getEmptyPos();
            if(emptyPos == -1){//没有空位置
                cb(Code.GAME.ROOM_IS_NOT_EXIT , null); //房间不存在
                return;
            }
            self.posWithPlayer[emptyPos] = uid;
            self._pushMessageToOther(uid , Event.playerEnter , {"userId" : uid , "pos" : emptyPos});
            cb(null , self._getAllInfo());
        }else{//重新进入  但是没有开始返回现在的状态
            cb(null , self._getAllInfo());
        }
    }
}
pro.getPlayerPosData = function(){
    var returnValue = [];
    for(var i = 0 ; i < this.playerNum ; i++){
        var player = this.posWithPlayer[i];
        if(player){
            var uid = player.userId;
            var item = {"uid":uid , "pos" : i };
            returnValue.push(item);
        }
    }
    return returnValue;
}
pro.destroy = function(gameId){
    this.__gameService__.destroy(gameId);
}
/**
 * 玩家已经准备
 * @param uid
 * @param cb  是否开始
 */
pro.playerReady = function(uid , cb){//准备游戏  向其他玩家推送准备消息
    var self = this;
    if(this.currentCardGame) {//游戏已经开始  不允许准备
        cb(Code.GAME.GAME_IS_START , null);
        return;
    }
    if(!this._playerIsInGame(uid)){//该玩家不在房间内
        cb(Code.GAME.PLAYER_NOT_EXIT , null);
        return;
    }
    this._playerReady(uid);
    if(self._isAllReady()){ //所有玩家都已经准备就绪
        var gameConfig = {"players" : self.posWithPlayer , "playNum":self.playerNum , "pukeConfig":ass.getConfig('withoutTT')};
        this._initCardGame(gameConfig);
    }
    self._pushMessageToOther(uid , Event.playerReady , {"uid":uid});
    cb(null , {"readyResult":true});
}
/**
 * 玩家离开
 * @param uid
 * @param cb
 */
pro.playerLeave = function(uid){
    if(this.isStarted){//游戏开始提示玩家掉线
        return;
    }
    this._playerCancel(uid);//如果该玩家准备了的 取消准备
    this._deletePlayer(uid);//删除该玩家
    //提示玩家离开

}
pro.sendPokes = function (uid , pokes , cb) {
    this.currentCardGame.playPoke(uid , pokes , function(code , res){
        cb(code , res);
    });
}
pro._initCardGame = function(gameConfig){
    var self = this;
    self.currentCardGame = new CardGame(gameConfig);
    var cardData = self.currentCardGame.dealingCard();//fapai
    self.isStarted = true;
    for(var pos in  self.posWithPlayer){
            var uid = self.posWithPlayer[pos];
            messageService.pushMessageToPlayer({uid:uid , sid:"connector-server-1"} ,Event.dealingCardOver,cardData[uid]);
    }
    this.currentCardGame.on(Event.TSW.onGameScoreChange , function(res){//fapai
        for(var pos in  self.posWithPlayer){
            var uid = self.posWithPlayer[pos];
            messageService.pushMessageToPlayer(uid ,Event.TSW.onGameScoreChange ,res);
        }
    });
    this.currentCardGame.on('gameOver' , function(res){//
        self._singleCardGameOver(res);
    });//this game is over return result
}
pro._pushMessageToOther = function (uid , route , msg) {
    for(var i = 0 ; i < this.playerNum ; i ++){
        var id = this.posWithPlayer[i];
        if(!id || id == uid){
            continue;
        }
        messageService.pushMessageToPlayer({uid:id , sid:"connector-server-1"} , route , msg);
    }
}
pro._singleCardGameOver = function(res){//单局结束

}
pro._getPlayerPos = function(uid){
    for(var i = 0 ; i < this.playerNum ; i ++){
        var player = this.posWithPlayer[i];
        if(!player && player== uid){
            return i;
        }
    }
    return -1;
}

pro._linkPlayer = function()
{
    var i = 0;
    while(i < this.playerNum){
        var thisPlayer = this.posWithPlayer[i];
        var nextPlayer = i == this.playerNum - 1 ? this.posWithPlayer[0] : this.posWithPlayer[i + 1];
        thisPlayer.setNextPlayer(nextPlayer);
    }
}
pro._getEmptyPos = function(){
    for(var i = 0 ; i < this.playerNum ; i ++){
        if(!this.posWithPlayer[i]){
            return i;
        }
    }
    return -1;
}
/**
 * 玩家准备
 * @param uid
 * @private
 */
pro._playerReady = function(uid){
    var index = utils.indexOf(this.readyPlayer , uid);
    if(index != -1){
        return;
    }
    this.readyPlayer.push(uid);
}
/**
 * 玩家取消准备
 * @param uid
 * @private
 */
pro._playerCancel = function (uid) {
    var index = utils.indexOf(this.readyPlayer , uid);
    if(index != -1){
        this.readyPlayer.splice(index , 1);
    }
}
pro._getPlayer = function(uid){
    var index = utils.indexOf(this.posWithPlayer , uid);
    if(index != -1){
        return this.posWithPlayer[index];
    }
    return null;
}

pro._getAllInfo = function(uid){
    var allInfo = {} , players = [] ;
    allInfo["players"] = players;
    if(this.currentCardGame){
        return this.currentCardGame.getCurrentFrameInfo(uid)
    }else{
        allInfo["currentStatus"] = TSWGameStatus.prepare;//0表示未开始
        for(var i = 0 ; i < this.posWithPlayer.length ; i++){
            var player = {};
            player["pos"] = i;
            player["uid"] = this.posWithPlayer[i];
            players.push(player);
        }
        return allInfo;
    }
}
pro._playerIsInGame = function (uid) {
    if(utils.indexOf(this.posWithPlayer , uid) != -1){
        return true;
    }
    return false;
}
pro._isAllReady = function(){
    if(this.readyPlayer.length == this.playerNum){
        return true;
    }
    return false;
}
pro._deletePlayer = function (uid) {
    var index = utils.indexOf(this.posWithPlayer , uid);
    if(index == -1){
        return;
    }
    this.posWithPlayer.splice(index , 1);
}

