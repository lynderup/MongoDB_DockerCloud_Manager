

var MongoDBManager = function (options) {
    var mongoDBInstanceManager = options.mongoDBInstanceManager;


    this.deployConfigServers = function(callback) {

        var command = "mongod --configsvr --dbpath /data/db --port 27017";

        mongoDBInstanceManager.deployConfigInstances(command, (err, set) => {
            callback(err, set);
        });

    }

    this.deployMongosServer = function(callback) {
        var configHostsStr = ""
        
        for(var i = 0; i < configHosts.length; i++) {
	    if(i != 0) {
	        configHostsStr += ",";
	    }
	    configHostsStr += configHosts[i].host + ":" + configHosts[i].port
        }
        
        var command = "mongos --configdb " + configHostsStr;

        mongoDBInstanceManager.deployMongoInstances("Mongos", command, (err, set) => {
            callback(err, set);
        });

    }

}

module.exports = exports = MongoDBManager;
