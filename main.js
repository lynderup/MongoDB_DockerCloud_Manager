var dockercloud = require('./dockercloud')

var logger = new require('./logger').Logger("main");

var deployConfigServers = (callback) => {

    var options = {
	'image' : "mongo",
	'name' : "mongoConfig",
	'target_num_containers' : 3,
	'run_command' : "mongod --configsvr --dbpath /data/db --port 27017",
	'deployment_strategy' : "HIGH_AVAILABILITY",
	'container_ports' : [{
            'protocol' : "tcp",
            'inner_port' : 27017,
            'published' : true
	}]
    };

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
	    
	    callback(null, service);
	});
    });
}

deployConfigServers((err, service) => {
    logger.log(err);
    logger.log(service);
}); 

var deployMongos = (configHosts, callback) => {
    var configHostsStr = ""
    
    for(var i = 0; i < configHosts.length; i++) {
	if(i != 0) {
	    configHostsStr += ",";
	}
	configHostsStr += configHosts[i].host + ":" + configHosts[i].port
    }
    
    var options = {
        'image' : "mongo",
        'name' : "mongos",
        'target_num_containers' : 1,
        'run_command' : "mongos --configdb " + configHostsStr,
        'deployment_strategy' : "HIGH_AVAILABILITY",
	'container_ports' : [{
            'protocol' : "tcp",
            'inner_port' : 27017,
            'published' : true
        }]
    };

    logger.log("Starting mongos service");
    dockercload.createService(options, (err, service) => {
        if (err) {
            callback(err);
            return;
        }
        if (instances.length == 0) {
            callback("No instances");
            return;
        }
	logger.log("Started mongos service");
	callback(null, service);
    });
};

