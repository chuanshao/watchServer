/**
 * Created by DELL on 2017/3/17.
 */
var poolModule = require('generic-pool');
var mongoose = require('mongoose');
var opts = {
    max: 10, // maximum size of the pool
    min: 2 // minimum size of the pool
}

var createMongoPool = function(app)
{
    var mongoConfig = app.get('mongo');
    var dbOptions = {
        server : {poolSize : 5},
        user:mongoConfig.admin,
        pass:mongoConfig.password
    }
    var url = mongoConfig.host + ':' + mongoConfig.port + '/' + mongoConfig.dbname;
    return poolModule.createPool({
        name:'mongodb',
        create:function () {
            mongoose.connect(url);
            return new Promise(function(resolve , reject){
                var client = mongoose.connection;
                client.on('error' , function(){
                    console.log(" 111111111111111111111111111111111111ere!");
                });
                client.once('open' , function(callback){
                    console.log("yay!");
                    resolve(client);
                });
            });
        },
        destroy: function(client) {
            return new Promise(function(resolve){
                client.on('end', function(){
                    resolve();
                })
                client.close();
            });
        },
    },opts);
}
// var createMongoPool = function(app)
// {
//     var mongoConfig = app.get('mongo');
//     var url = mongoConfig.host + ':' + mongoConfig.port + '/' + mongoConfig.dbname;
//     return poolModule.createPool({
//         name:'mongodb',
//         create:function (callback) {
//             mongoose.connect(url);
//             var db = mongoose.connection;
//             db.on('error' , function(){
//                 console.log(" 111111111111111111111111111111111111ere!");
//             });
//             db.once('open' , function(callback){
//                 console.log("yay!");
//                 callback(null, mongoose);
//             });
//         },
//         destroy: function(client) {
//             client.end();
//         },
//     },opts);
// }
exports.createMongoPool = createMongoPool;