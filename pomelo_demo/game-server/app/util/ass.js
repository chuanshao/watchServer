/**
 * Created by DELL on 2017/4/10.
 */
var fs = require('fs');
var ass = {}
var configs = {};
exports.getConfig = function (path , callback) {
    var realPath = "./pomelo_demo/game-server/config/" + path;
    if(configs[path]){
        callback(configs[path]);
        return;
    }
    _loadConfig(realPath , callback);
}

function _loadConfig (path , callBack){
    fs.readFile(path , 'utf8', function (err , data) {
        try{
            var jsonData = JSON.parse(data);
            configs[path] = jsonData;
            callBack(null , jsonData);
        }catch (e){
            callBack(err , null);
        }
    });
}
exports.ass = ass;
