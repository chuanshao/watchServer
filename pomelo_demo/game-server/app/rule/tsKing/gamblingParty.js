/**
 * Created by DELL on 2017/4/7.
 * 牌局
 */
var Code = require('../../../../shared/code');
var Player = require('./player');
var ass = require('../../util/ass');
var Game = require('./cardGame');
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
    this.readyNum = 0;
    this.posWithPlayer = {};
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
    returnData["isStarted"] = this.isStarted;
    if(this.isStarted){
        if(player){//玩家重新进入房间,返回玩家所需要的所有信息
            cb(null , returnData);
        }else{
            cb(Code.GAME.ROOM_IS_NOT_EXIT , null); //房间不存在
        }
    }else{
        if(!player){
            var emptyPos = this._getEmptyPos();
            if(emptyPos == -1){//没有空位置
                cb(Code.GAME.ROOM_IS_NOT_EXIT , null); //房间不存在
                return;
            }
            player = new Player(uid);
            this.posWithPlayer[emptyPos] = player;
            cb(null , returnData);
        }else{//重新进入  但是没有开始返回现在的状态
            cb(null , returnData);
        }
    }
}
pro.getPlayerPokeAnPosData = function(uid){
    var returnValue = [];
    for(var i = 0 ; i < this.playerNum ; i++){
        var player = this.posWithPlayer[i];
        if(player){
            var item = {};
            item["userId"] = player.userId;
            item["pos"] = i;
            item["playedPokes"] = player.getPlayedPokes();
            if(player.userId == uid){
                item["totalPokes"] = player.getTotalPokes();
            }
            returnValue.push(item);
        }
    }
    return returnValue;
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
/**
 * 改变位置
 * @param uid
 * @param pos
 */
pro.changePos = function(uid , pos , cb){
    if(this.isStarted) {
        cb(Code.GAME.GAME_IS_START, null);
        return;
    }
    if(pos > this.playerNum){//没有这个位置
        cb(Code.GAME.NO_THIS_POS , null);
        return;
    }
    if(this.posWithPlayer[pos]){//这个位置已经有人了
        cb(Code.GAME.POS_HAS_PLAYER , null);
        return;
    }
    var currentPos = this._getPlayerPos(uid);
    var player = this._getPlayer(uid);
    if(currentPos != -1){
        this.posWithPlayer[currentPos] =null;
    }
    this.posWithPlayer[pos] =player;
    cb(null , {"isSuccess" : true});
}
/**
 * 玩家已经准备
 * @param uid
 * @param cb  是否开始
 */
pro.playerReady = function(uid , cb){
    var self = this;
    if(this.isStarted) {
        cb(Code.GAME.GAME_IS_START , null);
        return;
    }
    var player = this._getPlayer(uid)
    if(!player && !player.isReady){
        player.isReady = true;
    }else{
        cb(Code.GAME.BE_READY_ERROR , null);
        return;
    }
    var cbData = {};
    cbData["readyResult"] = true;
    if(self._isAllReady()){ //所有玩家都已经准备就绪
        this.isStarted = true;
        var parmas = {"players" : self.posWithPlayer , "playNum":self.playerNum};
        this.currentCardGame = new Game(parmas);
        this.currentCardGame.startGame();
    }else{
        cbData["isStart"] = false;
        cb(null , cbData);
    }
}
/**
 * 玩家离开
 * @param uid
 * @param cb
 */
pro.playerLeave = function(uid){
    var pos = this._getPlayerPos(uid);
    if(pos != -1){
        this.posWithPlayer[pos] = null;
    }
}
pro.sendPokes = function (uid , pokes , cb) {
    this.currentCardGame.playPoke(uid , pokes , function(code , res){
        cb(code , res);
    });
}
pro._getPlayerPos = function(uid){
    for(var i = 0 ; i < this.playerNum ; i ++){
        var player = this.posWithPlayer[i];
        if(!player && player.userId == uid){
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
pro._getPlayer = function(uid){
    for(var player in this.posWithPlayer){
        if(player != null && player.userId == uid){
            return player;
        }
    }
    return null;
}

pro._getPlayerAndPos = function(){
    var returnValue = [];
    for(var i = 0 ; i < this.playerNum ; i++){
        var player = this.posWithPlayer[i];
        if(player){
            var uid = player.userId;
            var item = {"uid":uid , "pos" : i , "playedPokes" : playedPokes , "totalPokes":totalPokes};
            returnValue.push(item);
        }
    }
    return returnValue;
}

pro._isAllReady = function(){
    for(var i = 0 ; i < this.playerNum ; i++){
        var player = this.posWithPlayer[i];
        if(!player || !player.isReady){
           return false;
        }
    }
    return true;
}

