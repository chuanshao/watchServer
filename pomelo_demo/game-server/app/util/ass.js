/**
 * Created by DELL on 2017/4/10.
 */
var fs = require('fs');
var ass = {}
var configs = {};
var configFiles = [];
exports.getConfig = function (configName) {
    if(!configs || !configs[configName]){
        configs = _loadConfig();
    }
    return configs[configName];
}
function _loadConfig (){
    var path = "../../config/tspoke/";
    var data = {};
    if (configFiles.length === 0) {
        var dir = './game-server/config/tspoke';
        var name, reg = /\.json$/;
        fs.readdirSync(dir).forEach(function(file) {
            if (reg.test(file)) {
                name = file.replace(reg, '');
                configFiles.push(name);
                data[name] = require(path + file);
            }
        });
    } else {
        configFiles.forEach(function(name) {
            data[name] = require(path + name + '.json');
        });
    }

    return data;
}
exports.ass = ass;
