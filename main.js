var MongoDBManager = require('./MongoDBManager.js');
var MongoDBInstanceManager_DockerCloud = require('./MongoDBInstanceManager_DockerCloud');
var Logger = require('./Logger');

var logger = new Logger("main");


var dbManager = new MongoDBManager({
    mongoDBInstanceManager: new MongoDBInstanceManager_DockerCloud()
});


dbManager.deployConfigServers((err, set) => {
    logger.log(err);
    //logger.log(set);
    
});

