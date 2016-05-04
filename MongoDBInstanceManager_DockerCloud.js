var dockercloud = require('./dockercloud')

var MongoDBInstanceManager_DockerCloud = function() {

    var deployService = function(options, callback) {

        dockercloud.createService(options, (err, service) => {
	    if (err != null) {
	        callback(err);
	        return;
	    }
	    
	    service.start((err, service) => {
	        if (err != null) {
		    callback(err);
		    return;
	        }
	        console.log(service);
	        callback(null, service);
	    });
        });
    }

    this.deployConfigInstances = function(command, callback) {

        var options = {
	    'image' : "mongo",
	    'name' : "mongoConfig",
	    'target_num_containers' : 3,
	    'run_command' : command,
	    'deployment_strategy' : "HIGH_AVAILABILITY",
	    'container_ports' : [{
                'protocol' : "tcp",
                'inner_port' : 27017,
                'published' : true
	    }]
        };

        deployService(options, callback);

    }

    this.deployMongosInstance = function(name, command, callback) {

        var options = {
            'image' : "mongo",
            'name' : "mongos",
            'target_num_containers' : 1,
            'run_command' : command,
            'deployment_strategy' : "HIGH_AVAILABILITY",
	    'container_ports' : [{
                'protocol' : "tcp",
                'inner_port' : 27017,
                'published' : true
            }]
        };

    } 

    this.deployMongoInstances  = function(name, command, callback) {
    }

}

module.exports = exports = MongoDBInstanceManager_DockerCloud;
