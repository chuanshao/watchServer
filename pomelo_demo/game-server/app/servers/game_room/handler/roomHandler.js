/**
 * Created by DELL on 2017/3/27.
 */
var Code = require('../../../../../shared/code');
var userDao = require('../../../dao/userDao');
var RoomService = require('../../../util/roomService');
module.exports = function(app)
{
    return new Handler(app);
}
var Handler = function(app)
{
    this.app = app;
}

var pro = Handler.prototype;

pro.enterRoom = function(msg , session , next)
{
    var roomId = msg.roomId;
    var userId = msg.userId;
    var room = RoomService.getRoomService(this.app).getRoom(roomId);
    if(!room){
        next(null, {
            code: Code.ROOM.ROOM_IS_NOT_EXIT
        });
    }
    room.add(userId , session , function (err , res) {
        
    });
}

pro.createRoom = function(msg , session , next)
{
    var userId = msg.userId;
    RoomService.getRoomService(this.app).createRoom("");
}

pro.destroyRoom = function(msg , session , next)
{

}
