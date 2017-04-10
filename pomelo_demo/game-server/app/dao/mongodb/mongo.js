/**
 * Created by DELL on 2017/3/17.
 */
var mongoClient = module.exports;

var _pool;
var NND = {};
NND.init = function(app){
    _pool = require('./dao-pool').createMongoPool(app);
};

/**
 * Excute sql statement
 * @param {String} sql Statement The sql need to excute.
 * @param {Object} args The args for the sql.
 * @param {fuction} cb Callback function.
 *
 */
NND.insert = function(sql, args, cb){
    _pool.acquire().then(function(client) {
        _pool.release(client);
        //开始查询
    });
};
NND.model = function(name , schema)
{
    _pool.acquire().then(function(client) {
        client.model(name , schema);
    });
}

mongoClient.init = function(app)
{
    if (!!_pool){
        return mongoClient;
    } else {
        NND.init(app);
        mongoClient.insert = NND.insert;
        mongoClient.update = NND.query;
        mongoClient.delete = NND.query;
        mongoClient.query = NND.query;
        mongoClient.model = NND.model;
        return mongoClient;
    }
}