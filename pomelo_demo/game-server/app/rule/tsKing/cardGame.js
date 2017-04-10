/**
 * Created by DELL on 2017/4/6.
 */
var Code = require('../../../../shared/code');
var PlayRule = require('./playRule');
var cardGame = function(gameParam)
{
    return new Handler(gameParam);
}
var Handler = function(gameParam)
{
    this.currentPlayer = gameParam.banker;//当前应该出牌的玩家
    this.lastSendPlayer = null;//最后出牌的玩家
    this.playIndex = 0;
    this.banker = gameParam.banker; //庄家
    this.score = gameParam.score;//分数
    this.playerNum = gameParam.playerNum;
    this.players = gameParam.players;
    this.playRule = new PlayRule();
    this.currentScore = 0; //当前分数
}
/**
 *是否能提前结束
 */
pro.cutShortGame = function(){
    return false;
}
var pro = Handler.prototype;
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
 * 统计结果
 * @private
 */
pro._statisticalResults = function()
{
    var returnValue = {};
    var isOver = this._isOver(this.players);
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
        var bigPlayer = this.playRule.judgeWithOneIsBig(this.players);
        if(bigPlayer.id == this.banker.id)//庄家最大
        {
            return;
        }else//闲家最大,计分
        {
            this.currentScore += this._getPlayCircleScore(this.players);
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
 * 获取正在玩的玩家
 * @param uid
 * @returns {*}
 * @private
 */
pro._getPlayer = function(uid)
{
    for(var i = 0 ; i < this.players.length ; i ++)
    {
        var player = this.players[i];
        if(player.id == uid)
        {
            return player;
        }
    }
    return null;
}


