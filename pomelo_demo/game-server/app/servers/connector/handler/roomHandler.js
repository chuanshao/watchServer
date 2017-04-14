/**
 * Created by DELL on 2017/3/27.
 */
var Code = require('../../../../../shared/code');
module.exports = function(app)
{
    return new Handler(app);
}
var Handler = function(app)
{
    this.app = app;
    this.roomService = this.app.get("roomService");
}

var pro = Handler.prototype;

pro.enterRoom = function(msg , session , next)
{
    var roomId = msg.roomId;
    var userId = msg.userId;
    this.roomService.enterRoom(userId , roomId , function (err , res) {
        if(err){
            next(err, null);
        }else{
            next(null, res);
        }
    });
}

pro.createRoom = function(msg , session , next)
{
    var userId = msg.userId;
    var setting = msg.setting;
    this.roomService.createRoom(userId , setting , function (err , res) {
        if(err){
            next(err , null);
        }else{
            next(null , res);
        }
    });
}

pro.destroyRoom = function(msg , session , next)
{

}

