/**
 * Created by DELL on 2017/4/7.
 */
var Code = require('../../../../shared/code');
var Player = require('./player');
var ass = require('../../util/ass');
module.exports = function(setting)
{
    return new Handler(setting);
}
var Handler = function(setting){
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
 * 进入房间
 * @param uid
 * @param pos
 */
pro.playerEnterRoom = function(uid  , cb){
    var player = this._getPlayer(uid);
    if(this.isStarted){
        if(player != null){//玩家重新进入房间,返回玩家所需要的所有信息

        }else{
            cb(Code.GAME.ROOM_IS_NOT_EXIT , null); //房间不存在
        }
    }else{
        if(player == null){
            var emptyPos = this._getEmptyPos();
            if(emptyPos == -1){//没有空位置
                cb(Code.GAME.ROOM_IS_NOT_EXIT , null); //房间不存在
                return;
            }
            player = new Player(uid);
            this.posWithPlayer[emptyPos] = player;
        }else{//重新进入  但是没有开始返回现在的状态

        }
    }
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
    cb(null , pos);
}

/**
 * 玩家已经准备
 * @param uid
 * @param cb  是否开始
 */
pro.playerReady = function(uid , cb){
    self = this;
    if(this.isStarted) {
        cb(Code.GAME.GAME_IS_START);
        return;
    }
    if(!this._getPlayer(uid)){
        this.readyNum ++;
    }
    if(this.readyNum == this.playerNum){ //
        this.isStarted = true;

        this._dealingCard(function(err , res){
            cb(self.posWithPlayer);
        });
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
        if(this.posWithPlayer[i]){
            return i;
        }
    }
    return -1;
}
/**
 * 发
 * @private
 */
pro._dealingCard = function(){
    ass.getConfig("tspoke/withoutTT.json" ,function (err , jsonData) {
        var self = this;
        var readyArr = pro._washCard(jsonData , 0 , 3);//
        var eachPlayerHas = Math.floor(readyArr / self.playerNum);
        for(var i = 0 ; i < self.playerNum ; i++){
            var player = self.posWithPlayer[i];
            player.setPokes(readyArr.splice(eachPlayerHas * i , eachPlayerHas * i+1));
        }
    });
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
pro._getPlayer = function(uid){
    for(var player in this.posWithPlayer){
        if(player != null && player.userId == uid){
            return player;
        }
    }
    return null;
}

module.exports = friendsGameManager;