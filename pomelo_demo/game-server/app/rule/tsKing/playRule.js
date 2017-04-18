/**
 * Created by DELL on 2017/4/6.
 */

var PlayRule = function(setting)
{
    return new Handler(setting);
}
var Handler = function(setting)
{
    this.trackTurn = setting.trackTurn;//拖拉机是否带拐弯
}

var pro = Handler.prototype;
/**
 * 认证出牌是否符合规则
 * @param player  当前玩家
 * @param lastPlayer 上个玩家
 */
pro.authPlayedPoke = function(player , lastPlayer)
{

    return true;
}


/**
 * 判断谁的最大,返回最大的玩家
 * @param players
 */
pro.judgeWithOneIsBig = function(players)
{
    var returnPlayer = null;
    for(var i = 0 ; i < players.length - 1 ; i ++){
        var player1 = players[i];
        var player2 = players[i+1];
        returnPlayer = comparePokes(player1.getLastPlayed() , player2.getLastPlayed()) ? player1 : player2;
    }
    return returnPlayer;
}
/**
 * 如果第一个比第二个大  那么返回true
 * @param pokes1
 * @param pokes2
 */
var comparePokes = function (pokes1 , pokes2) {
    return true;
}
module.exports = PlayRule;