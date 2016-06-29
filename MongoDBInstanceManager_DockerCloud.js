var dockercloud = require('./dockercloud')

var MongoDBInstanceManager_DockerCloud = function() {

    const INSTANCE_PREFIX = "MongoDB-";
    const CONFIG_PREFIX = "ConfigServer-";
    const MONGOS_PREFIX = "Mongos-";

    var instanceManager = this;

    // Constructs a MongoDBInstance object from a container object
    var MongoDBInstance = function(type, container) {

        this.type = type
        this.name = container.name;
        this.id = container.uuid;

        // Ugly dockercloud object names
        this.host = container.public_dns;
        // TODO: be sure that we get to one mapped to 27017
        this.port = container.container_ports[0].outer_port; 
    }


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

    var waitOnService = function(service, callback) {
        var visit = function(count, service) {
            if(count == 5) {
                callback("Service took to long to start");
                return;
            }
            
            if (service.state == "Running") {
                callback(null);
            } else if (service.state == "Starting") {
                setTimeout(() => {
                    dockercloud.getService(service.uuid, (err, service) => {
                        if (err) {callback(err); return;}
                        visit(++count, service);
                    });
                }, 1000);
            } else {
                callback("service is not starting");
            }
        }
        visit(0, service);
    }

    // Gets list of all deployed mongoDB instances
    this.getDeployedInstances = function(callback) {
        dockercloud.listContainers((err, containers) => {
            if (err) {callback(err); return;}
            
            var instances = [];

            for (var i = 0; i < containers.length; i++) {
                var container = containers[i];
                if (container.name.substring(0, INSTANCE_PREFIX.length) == INSTANCE_PREFIX
                   && container.state == "Running") {
                    instances.push(new MongoDBInstance("", container));
                }
            }

            callback(null, instances);
        });
    }

    // Gets a list of all deployed MongoDB config servers
    this.getDeployedConfigInstances = function(callback) {
        instanceManager.getDeployedInstances((err, instances) => {
            if (err) {callback(err); return;}

            var configInstances = [];

            for (var i = 0; i < instances.length; i++) {
                var instance = instances[i];
                if (instance.name.substring(0, INSTANCE_PREFIX.length + CONFIG_PREFIX.length) 
                    == INSTANCE_PREFIX + CONFIG_PREFIX) {
                    configInstances.push(instance);
                }
            }

            callback(null, configInstances);
    
        })
    };

    // Gets a MongoDB mongos server if there is one else null
    this.getOneDeployedMongosInstance = function(callback) {
        instanceManager.getDeployedInstances((err, instances) => {
            if (err) {callback(err); return;}

            var configInstances = [];

            for (var i = 0; i < instances.length; i++) {
                var instance = instances[i];
                if (instance.name.substring(0, INSTANCE_PREFIX.length + MONGOS_PREFIX.length) 
                    == INSTANCE_PREFIX + MONGOS_PREFIX) {
                    callback(null, instance);
                    return;
                }
            }

            callback(null, null);
    
        })
    };


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
            
            waitOnService(service, (err) => {
                if (err) {callback(err); return;}
                
                service.getContainers((err, containers) => {
                    if (err) {callback(err); return;}
                    
                    var instances = [];
                    
                    for (var i = 0; i < containers.length; i++) {
                        instances.push(new MongoDBInstance("config", containers[i]));
                    }

                    callback(null, instances);
                });
            });
        });

    }

    // Deploys a service with 1 instances as mongoDB mongos server
    this.deployMongosInstance = function(name, command, callback) {
        
        var options = {
            'image' : "mongo",
            'name' : INSTANCE_PREFIX + MONGOS_PREFIX + name,
            'target_num_containers' : 1,
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

            waitOnService(service, (err) => {
                if (err) {callback(err); return;}
            
                service.getContainers((err, containers) => {
                    if (err) {callback(err); return;}

                    var instances = [];
                    
                    for (var i = 0; i < containers.length; i++) {
                        instances.push(new MongoDBInstance("mongos", containers[i]));
                    }

                    if (instances.length != 1) {
                        callback("Something went wrong and there isn't 1 mongos")
                    } else {
                        callback(null, instances[0]);
                    }
                });
            });
        });


    } 

    // Deploys a service with 3 instances as mongoDB servers 
    this.deployMongoInstances  = function(name, command, callback) {
    }

}

module.exports = exports = MongoDBInstanceManager_DockerCloud;
