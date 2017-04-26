var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtils');
var RoomService = require('./app/util/roomService');
var ChatService = require('./app/services/chatService');
var GameService = require('./app/services/gameService');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'pomelo_demo');
// app configuration

app.configure('production|development' , function(){
    app.loadConfig('mongo' , app.getBase() + '/../shared/config/mongo.json');//加載mongodb配置表
});
app.configure('production|development', 'connector', function() {
    var dbclient = require('./app/dao/mongodb/mongo').init(app);
    app.set('dbclient', dbclient);
    // app.load(pomelo.sync, {path:__dirname + '/app/dao/mapping', dbclient: dbclient});
    // app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient}});
});
app.configure('production|development', 'connector', function(){
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector,
            heartbeat : 30,
            useDict : true,
            useProtobuf : true,
            handshake : function(msg, cb){
                cb(null, {});
            }
        });
});

// Configure for auth server
app.configure('production|development', 'user', function() {
    // load session congfigures
    app.set('session', require('./config/session.json'));
});

app.configure('production|development', 'gate', function(){
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector,
            useProtobuf : true,
            handshake : function(msg, cb){
                cb(null, {});
            }
        });
});
app.configure('production|development', 'chat', function() {
    app.set('chatService', new ChatService(app));
});
app.configure('production|development', 'game', function() {
    app.set('gameService', new GameService(app));
});
// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});