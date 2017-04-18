/**
 * Created by DELL on 2017/3/15.
 */
var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.gameRoom = function(session, msg, app, cb) {
    var chatServers = app.getServersByType('game');

    if(!chatServers || chatServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }
    var res = dispatcher.dispatch(session.get('rid'), chatServers);
    cb(null, res.id);
};
