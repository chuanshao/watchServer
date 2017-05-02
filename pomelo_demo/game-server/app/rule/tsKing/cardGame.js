/**
 * Created by DELL on 2017/4/6.
 */
var Code = require('../../../../shared/code');
var PlayRule = require('./playRule');
var Player = require('./player');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Event = require('../../consts/consts').Event;
var TSWGameStatus = require('../../consts/consts').TSWGameStatus;
module.exports = function(gameParam)
{
    return new Handler(gameParam);
}
var Handler = function(gameParam)
{
    EventEmitter.call(this);
    this.currentStatus = TSWGameStatus.setScore;
    this.posWithPlayer = [];
    this.bottomCard = [];
    this.currentPlayer = null;//当前应该出牌的玩家
    this.lastSendPlayer = null;//最后出牌的玩家
    this.playIndex = 0;
    this.banker = null; //庄家
    this.maxScore = 90;//最大分数
    this.playerNum = gameParam["playNum"];
    this.playRule = new PlayRule();
    this.currentScore = 0; //当前分数,默认最多
    this.giveUpSetScoreNum = 0; //放弃叫分玩家数量
    this.currentSetScorePlayer = null;//当前叫分玩家
    this.pukeConfig = gameParam["pukeConfig"];
    this._init(gameParam["players"]);
}
util.inherits(Handler, EventEmitter);
var pro = Handler.prototype;
/**
 *是否能提前结束
 */
pro.cutShortGame = function(){
    return false;
}
/**
 * 叫分
 * @param uid
 * @param score
 * @param cb
 */
pro.setScore = function(uid, score , cb){
    if(score <= this.currentScore || score % 5 != 0 || score < 0||score > this.maxScore){
        cb(Code.GAME.SET_SCORE_ERROR , null);
        return;
    }
    this.score = score;
    this.currentSetScorePlayer = this._getPlayer(uid);
    if(score == 0){
        this._setScoreOver(cb);
    }
}
/**
 * 放弃叫分
 * @param uid
 * @param cb
 */
pro.giveUpSetScore = function(uid , cb){
    this.giveUpSetScoreNum ++;
    if(this._setScoreIsOver()){
        this._setScoreOver(cb);
    }
}
///玩家出
pro.playPoke = function(uid , pokes , cb)
{
    var self = this;
    var player = self._getPlayer(uid);
    if(!player){
        cb(Code.USER.NO_USER , null);
        return;
    }
    if(player.userId != self.currentPlayer.userId){//出牌顺序错误
        cb(Code.GAME.SEND_POKE_Error_Sequence , null);
        return;
    }
    player.add(pokes);
    if(self.playRule.authPlayedPoke(this.currentPlayer , this.lastSendPlayer)) {
        self._scoreIndicator();//算分
        if(self._isOver()){
            this.emit(Event.singleGameOver , null);
        }
        cb(null,{"success":true});
    }else{
        cb(Code.GAME.SEND_POKE_Fail , null);
    }
}
pro.bankerBuckleCard = function (uid , pokes) {
    this.currentStatus = TSWGameStatus.playing;
}
pro._setScoreOver = function(cb){
    this._initBankAndFirstSend();//定庄家
}
pro._init = function(pwp){

    for(var i = 0 ; i < this.playerNum ; i++){
        var uid = pwp[i];
        var player = new Player(uid , i);
        this.posWithPlayer.push(player);
    }
}
pro._setScoreIsOver = function(){
    return this.playerNum - this.giveUpSetScoreNum == 1;
}
pro._initBankAndFirstSend = function () {
    this.banker = this.currentSetScorePlayer;
    this.currentPlayer = this.currentSetScorePlayer;
    this.currentStatus = TSWGameStatus.bankerBuckleCard;
}
/**
 * 统计结果
 * @private
 */
pro._statisticalResults = function()
{
    var returnValue = {};
    var isOver = this._isOver(this.posWithPlayer);
    returnValue.currentScore = this.currentScore;
    returnValue.isOver = isOver;
    return returnValue;
}
/**
 * 算分
 * @private
 */
pro._scoreIndicator = function()
{
    if(this.playIndex != 0 && this.playIndex % this.playerNum == 0)//一圈打完  判断谁最大
    {
        var bigPlayer = this.playRule.judgeWithOneIsBig(this.posWithPlayer);
        if(bigPlayer.id == this.banker.id)//庄家最大
        {
            return;
        }else//闲家最大,计分
        {
            var thisCircleScore = this._getPlayCircleScore(this.posWithPlayer);
            this.currentScore += thisCircleScore;
            this.emit(Event.TSW.onGameScoreChange , {"addScore":thisCircleScore , "totalScore":this.currentScore}); //分数改变
        }
        this.currentPlayer = bigPlayer;
        this.lastSendPlayer = null;
    }else{
        this.lastSendPlayer = this.currentPlayer;
        this.currentPlayer = this.currentPlayer.getNextPlayer();
    }
}

/**
 * 获取这一圈的分数
 * @param players
 * @private
 */
pro._getPlayCircleScore = function(players)
{
    var totalScore = 0;
    for(var i = 0 ; i < players.length ; i++){
        var player = players[i];
        var currentPokes = player.getLastPlayed();
        for(var j = 0 ; j < currentPokes.length ; j++) {
            var pokeItem = currentPokes[j];
            totalScore += pokeItem.getScore();
        }
    }
}
/**
 * 获取这一圈的分数
 * @param players
 * @private
 */
pro._isOver = function()
{
    var totalScore = 0;
    for(var i = 0 ; i < this.posWithPlayer.length ; i++){
        var player = this.posWithPlayer[i];
        if(!player.pokeIsEmpty()){
            return false;
        }
    }
    return true;
}
/**
 * 发牌
 * @private
 */
pro.dealingCard = function(){
    var self = this;
    var readyArr = pro._washCard(self.pukeConfig , 0 , 3);//
    var eachPlayerHas = Math.floor(readyArr.length / self.playerNum);
    console.log("readyArr" + readyArr);
    for(var i = 0 ; i < self.playerNum ; i++){
        var player = self.posWithPlayer[i];
        player.setPokes(readyArr.splice(eachPlayerHas * i , eachPlayerHas * i+1));
    }
    return self._getDealingCardData();
}
pro._getDealingCardData = function(){
    var returnData = {};
    var self = this;
    for(var i = 0 ; i < self.posWithPlayer.length ; i++){
        var player = self.posWithPlayer[i];
        var uid = player.getUserId();
        returnData[uid] = player.getTotalPokes();
    }
    return returnData;
}
/**
 *
 * @param cardArr
 * @param index 当前次数
 * @param total 总次数
 * @private
 */
pro._washCard = function(cardArr , index , total){
    var nextIndex = index + 1;
    var returnArr = cardArr;
    for(var i = 0 ; i < 50 ; i++){
        var index1 = Math.floor(Math.random() * cardArr.length);
        var index2 = Math.floor(Math.random() * cardArr.length);
        var switchNum = returnArr[index1];
        returnArr[index1] = returnArr[index2];
        returnArr[index2] = switchNum;
    }
    if(nextIndex == total){
        return pro._washCard(returnArr , nextIndex , total);
    }else{
        return returnArr;
    }
}
/**
 * 获取正在玩的玩家
 * @param uid
 * @returns {*}
 * @private
 */
pro._getPlayer = function(uid)
{
    for(var i = 0 ; i < this.playerNum ; i ++)
    {
        var player = this.posWithPlayer[i];
        if(player.id == uid)
        {
            return player;
        }
    }
    return null;
}

pro.getCurrentFrameInfo = function(uid){
    var returnData = {} , players = []  ;
    returnData["players"] = players;
    returnData["currentStatus"] = this.currentStatus;
    returnData["currentScore"] = this.currentScore;
    for(var i = 0 ; i < this.playerNum ; i ++)
    {
        var player = {};
        player["pos"] = this.posWithPlayer[i].getPos();
        player["uid"] = this.posWithPlayer[i].getUserId();
        if(player.uid == uid)
        {
            player["totalPoke"] =this.posWithPlayer[i].getTotalPokes();
        }
        switch (this.currentStatus){//判断当前处于什么状态
            case TSWGameStatus.setScore:
                player["isGiveUp"] = this.posWithPlayer[i].isGiveUp;
                returnData["setScorePlayer"] = this.currentSetScorePlayer.getUserId();
                break;
            case TSWGameStatus.bankerBuckleCard:
            case TSWGameStatus.playing:
                returnData["bankerId"] = this.banker.getUserId();
                if(uid == this.banker.getUserId()){
                    returnData["bottomCard"] = this.bottomCard;
                }
                break;
        }
        player["sendPoke"] =this.posWithPlayer[i].getPlayedPokes();
    }
    return returnData;
}


