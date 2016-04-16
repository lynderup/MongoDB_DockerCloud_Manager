var dockercloud = require('./dockercloud')

/*
dockercloud.listNodes((res, err) => {
    if (err != null) {
	console.log(err);
	return;
    }
    console.log("Nodes:");
    console.log(res);
});

dockercloud.listServices((res, err) => {
    if (err != null) {
	console.log(err);
	return;
    }
    console.log("Services:");
    console.log(res);
});

var options = {
    image : "dockercloud/hello-world",
    name : "Hallo-world",
    target_num_containers : 1
}*/

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

dockercloud.createService(options, (service, err) => {
    if (err != null) {
	console.log(err);
	return;
    }
    
    console.log(service);
    service.start((service, err) => {
	if (err != null) {
	console.log(err);
	return;
    }
	
	console.log(service);
    });
});

/*
dockercloud.listContainers((res, err) => {
    if (err != null) {
	console.log(err);
	return;
    }
    console.log("Container:");
    console.log(res);
});
*/

