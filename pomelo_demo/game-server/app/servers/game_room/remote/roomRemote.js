/**
 * Created by DELL on 2017/3/15.
 */
module.exports = function(app)
{
    return new RoomRemote(app);
}

var RoomRemote = function(app)
{
    this.app = app;
    this.channelService = app.get('channelService');
}

RoomRemote.prototype.add = function(uid , sid , name , flag ,cb)
{
    var channel = this.channelService.getChannel(name , flag);
}
RoomRemote.prototype.createRoom = function(name , cb)
{
    var channel = this.channelService.createChannel(name);
}
RoomRemote.prototype.broadcast = function(msg , cb)
{

}