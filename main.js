var MongoDBManager = require('./MongoDBManager.js');
var MongoDBInstanceManager_DockerCloud = require('./MongoDBInstanceManager_DockerCloud');
var Logger = require('./Logger');

var logger = new Logger("main");

var mongoDBInstanceManager = new MongoDBInstanceManager_DockerCloud();

var dbManager = new MongoDBManager({
    mongoDBInstanceManager: mongoDBInstanceManager
});

dbManager.start()
