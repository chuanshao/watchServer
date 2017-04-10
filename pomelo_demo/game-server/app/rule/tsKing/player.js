/**
 * Created by DELL on 2017/4/7.
 */
var Player = function(uid)
{
    this.userId = uid;
    this.totalPokes = [];
    this.playedPokes = [];
    this.nextPlayer = null;
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
pro.setNextPlayer = function(player){
    this.nextPlayer = player;
}
pro.getNextPlayer = function()
{
    return this.nextPlayer;
}


module.exports = Player;