var Logger = require('./Logger');

var logger = new Logger("MongoDBManager");


var MongoDBManager = function (options) {
    var mongoDBInstanceManager = options.mongoDBInstanceManager;

    // Deploy 3 config servers if there isn't already 3
    // TODO: if some configservers is found but not 3, only start the missing
    var deployConfigServers = function(callback) {
        // Check if config servers was started ealier
        mongoDBInstanceManager.getDeployedConfigInstances((err, configInstances) => {
            if (err) {callback(err); return;}

            if (configInstances.length == 3) {
                console.log("Found already deployed config servers");
                callback(null, configInstances);
                return;
            }

            var command = "mongod --configsvr --dbpath /data/db --port 27017";

            console.log("Starting config servers");
            mongoDBInstanceManager.deployConfigInstances(command, (err, configInstances) => {
                if (err) {callback(err); return;}

                console.log("Started config servers");
                callback(null, configInstances);
            });
        });
    }

    var deployMongosServer = function(configInstances, callback) {
        
         mongoDBInstanceManager.getOneDeployedMongosInstance((err, mongos) => {
             if (err) {callback(err); return;}
             
             if (mongos) {
                 console.log("Found already deployed mongos server");
                 callback(null, mongos);
                 return;
             }

             if (configInstances.length != 3) {
                 callback("There need to be exactly 3 config servers. Got " 
                          + configInstances.length)
                 return;
             }
        
             // configInstances guarantied to have 3 elements
             var command = "mongos --configdb " + 
                 configInstances[0].host + ":" + configInstances[0].port + 
                 "," + configInstances[1].host + ":" + configInstances[1].port + 
                 "," + configInstances[2].host + ":" + configInstances[2].port

             console.log("Starting mongos server");
             mongoDBInstanceManager.deployMongosInstance("mongos", command, (err, mongos) => {
                 if (err) {callback(err); return;}

                 console.log("Started mongos server");
                 callback(null, mongos);
             });
         });
    }

    this.start = function() {
        deployConfigServers((err, configInstances) => {
            if (err) {
                console.log("Error:");
                console.log(err);
                return;
            }
            deployMongosServer(configInstances, (err, mongosInstance) => {
                if (err) {
                    console.log("Error:");
                    console.log(err);
                    return;
                }
            });
        });
    }

}

module.exports = exports = MongoDBManager;
