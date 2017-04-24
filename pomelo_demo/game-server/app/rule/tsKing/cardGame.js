/**
 * Created by DELL on 2017/4/6.
 */
var Code = require('../../../../shared/code');
var PlayRule = require('./playRule');
var Player = require('./player');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Handler = function(gameParam)
{
    EventEmitter.call(this);
    this.posWithPlayer = [];
    this.currentPlayer = null;//当前应该出牌的玩家
    this.lastSendPlayer = null;//最后出牌的玩家
    this.playIndex = 0;
    this.banker = null; //庄家
    this.score = 0;//分数
    this.playerNum = gameParam.playerNum;
    this.playRule = new PlayRule();
    this.currentScore = gameParam.maxScore; //当前分数,默认最多
    this.giveUpSetScoreNum = 0; //放弃叫分玩家数量
    this.currentSetScorePlayer = null;//当前叫分玩家
    this.pukeConfig = gameParam.pukeConfig;
    this._init(gameParam.posWithPlayer);
    this._dealingCard();//发牌
}
util.inherits(Handler, EventEmitter);
module.exports = function(gameParam)
{
    return new Handler(gameParam);
}

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
    if(score <= this.currentScore || score % 5 != 0 || score < 0){
        cb(Code.GAME.SET_SCORE_ERROR , null);
        return;
    }
    this.score = score;
    this.currentSetScorePlayer = this._getPlayerPos(uid);
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
        var returnValue = self._statisticalResults();//计算结果
        cb(null,returnValue);
    }else{
        cb(Code.GAME.SEND_POKE_Fail , null);
    }
}
/**
 * 开始游戏
 */
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
            this.currentScore += this._getPlayCircleScore(this.posWithPlayer);
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
pro._isOver = function(players)
{
    var totalScore = 0;
    for(var i = 0 ; i < players.length ; i++){
        var player = players[i];
        if(!player.isEmpty()){
            return false;
        }
    }
    return true;
}
/**
 * 发牌
 * @private
 */
pro._dealingCard = function(){
    var self = this;
    var readyArr = pro._washCard(self.pukeConfig , 0 , 3);//
    var eachPlayerHas = Math.floor(readyArr / self.playerNum);
    for(var i = 0 ; i < self.playerNum ; i++){
        var player = self.posWithPlayer[i];
        player.setPokes(readyArr.splice(eachPlayerHas * i , eachPlayerHas * i+1));
    }
    this.emit('dealingCardOver' , this._getDealingCardData());
}
pro._getDealingCardData = function(){
    var returnData = {};
    for(var i = 0 ; i < self.playerNum ; i++){
        var player = self.posWithPlayer[i];
        var uid = player.userId;
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
    var returnArr = [];
    for(var i = 0 ; i < 50 ; i++){
        var index1 = Math.floor(Math.random() * cardArr.length);
        var index2 = Math.floor(Math.random() * cardArr.length);
        var switchNum = returnArr[index1];
        returnArr[index1] = returnArr[index2];
        returnArr[index2] = switchNum;
    }
    if(nextIndex == total){
        return pro._washCard(cardArr , nextIndex , total);
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


