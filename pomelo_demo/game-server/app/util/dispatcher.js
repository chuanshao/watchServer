/**
 * Created by DELL on 2017/3/15.
 */
var crc = require('crc');
module.exports.dispatch = function(uid , connectors)
{
    var index = Math.abs(crc.crc32(uid)) % connectors.length;
    return connectors[index];
}