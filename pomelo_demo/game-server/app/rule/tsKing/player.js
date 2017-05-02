/**
 * Created by DELL on 2017/4/7.
 */
var Player = function(uid , currentPos)
{
    this.userId = uid;
    this.totalPokes = [];
    this.playedPokes = [];
    this.nextPlayer = null;
    this.isGiveUp = false;
    this.currentPos= currentPos;
}
var pro = Player.prototype;
pro.getLastPlayed = function()
{
    if(this.playedPokes.length == 0) return null;
    return this.playedPokes[this.playedPokes.length - 1];
}
/**
 * 初始化玩家拥有的
 * @param pokes
 */
pro.setPokes = function(pokes)
{
    this.totalPokes = pokes;
}
pro.getUserId = function () {
    return this.userId;
}
pro.setNextPlayer = function(player){
    this.nextPlayer = player;
}
pro.getPos = function(){
    return this.currentPos;
}
pro.getNextPlayer = function()
{
    return this.nextPlayer;
}
pro.pokeIsEmpty = function(){
    return this.totalPokes.length == 0 ? true : false;
}
pro.getPlayedPokes = function(){
    return this.playedPokes;
}
pro.getTotalPokes = function(){
    return this.totalPokes;
}
module.exports = Player;