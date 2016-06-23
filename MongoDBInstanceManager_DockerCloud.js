var dockercloud = require('./dockercloud')

var MongoDBInstanceManager_DockerCloud = function() {

    var INSTANCE_PREFIX = "MongoDB-";
    var CONFIG_PREFIX = "ConfigServer-";
    var MONGOS_PREFIX = "Mongos-";

    // Creates a service on docker cloud and starts it
    var deployService = function(options, callback) {

        dockercloud.createService(options, (err, service) => {
	    if (err) {callback(err); return;}
	    
	    service.start((err, service) => {
	        if (err) {callback(err); return;}
	        callback(null, service);
	    });
        });
    }

    // Gets list of all deployed mongoDB instances
    this.getDeployedInstances = function(callback) {
        dockercloud.listContainers((err, containers) => {
            if (err) {callback(err); return;}
            
            var instances = [];

            for (var i = 0; i < containers.length; i++) {
                var container = containers[i];
                if (container.name.substring(0, INSTANCE_PREFIX.length) == INSTANCE_PREFIX) {
                    instances.push(container);
                }
            }

            callback(null, instances);
        });
    }

    // Deploys a service with 3 instances as mongoDB config servers 
    this.deployConfigInstances = function(command, callback) {

        var options = {
	    'image' : "mongo",
	    'name' : INSTANCE_PREFIX + CONFIG_PREFIX + "config",
	    'target_num_containers' : 3,
	    'run_command' : command,
	    'deployment_strategy' : "HIGH_AVAILABILITY",
	    'container_ports' : [{
                'protocol' : "tcp",
                'inner_port' : 27017,
                'published' : true
	    }]
        };

        deployService(options, (err, service) => {
            if (err) {callback(err); return;}
            callback(null, service);
            // service.getContainers((err, containers) => {
            //     if (err) {callback(err); return;}
                
            //     console.log(containers[0]);
            //     callback(null, containers);
            // })
        });

    }

    // Deploys a service with 1 instances as mongoDB mongos server
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

    // Deploys a service with 3 instances as mongoDB servers 
    this.deployMongoInstances  = function(name, command, callback) {
    }

}

module.exports = exports = MongoDBInstanceManager_DockerCloud;
