/**
 * Created by DELL on 2017/3/27.
 */
var Code = require('../../../../../shared/code');
var userDao = require('../../../dao/userDao');
module.exports = function(app)
{
    return new Handler(app);
}
var Handler = function(app)
{
    this.app = app;
    this.channelService = app.channelService;
}

var pro = Handler.prototype;

pro.enterRoom = function(msg , session , next)
{

}

pro.createRoom = function(msg , session , next)
{

}

pro.destroyRoom = function(msg , session , next)
{

}
