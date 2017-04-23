/**
 * f服务器的入口分配服务器给客户端连接
 * Created by DELL on 2017/3/15.
 */

module.exports = function(app) {
    return new Handler(app);
};

 var Code = require('../../../../../shared/code');
var dispatcher = require('../../../util/dispatcher');
var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
handler.queryEntry = function(msg, session, next) {
    console.log(msg);
    var uid = msg.uid;
    if(!uid) {
        next(null, {
            code: Code.FAIL
        });
        return;
    }
    // get all connectors
    var connectors = this.app.getServersByType('connector');
    if(!connectors || connectors.length === 0) {
        next(null, {
            code: Code.FAIL
        });
        return;
    }
    // select connector
    var res = dispatcher.dispatch("" + uid, connectors);
    next(null, {
        code: Code.OK,
        host: res.host,
        port: res.clientPort
    });
};
