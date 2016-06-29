var https = require('https');



// Sends a http request to the docker cloud 

var dockerCloudAPICall = function(path, method, data, callback) {
    var apikey = new Buffer("lynderup:3d936ed4-b65e-4fe3-8643-be799838a9f5").toString('base64');

    var headers = {
	    Authorization: 'Basic ' + apikey,
	    Accept: "application/json"
    }

    var postData = JSON.stringify(data);
    
    if (method == 'POST') {
	headers['Content-Type'] = "application/json";
	headers['Content-Length'] = postData.length;
    }
    
    
    var options = {
	hostname: 'cloud.docker.com',
	port: 443,
	path: path,
	method: method,
	headers: headers
    };

    var req = https.request(options, (res) => {

	var data = "";
	res.on('data', (d) => {
	    data += d;
	});

	res.on('end', () => {
	    callback(null, JSON.parse(data));
	});
    });
    
    req.on('error', (e) => {
	callback(e);
    });

    if (method == 'POST') {
	req.write(postData);
    }
    
    req.end();
}

// Constructor to make a service object from the json object returned from docker cloud
var Service = function(serviceJson) {
    var uuid = serviceJson.uuid;

    // Copy all elements
    for (var k in serviceJson) {
        this[k] = serviceJson[k];
    }

    // returns json representation of the service
    this.toString = function() {
        return JSON.stringify(serviceJson, null, 2);
    }

    // sends a start request for the service to docker cloud
    this.start = function(callback) {
	dockerCloudAPICall("/api/app/v1/service/" + uuid + "/start/", 'POST', null, (err, res) => {
	    if (err) {callback(err); return;}
	    callback(null, new Service(res));
	});
    }

    // sends a stop request for the service to docker cloud
    this.stop = function(callback) {
	dockerCloudAPICall("/api/app/v1/service/" + uuid + "/start/", 'POST', null, (err, res) => {
	    if (err) {callback(err); return;}
	    callback(null, new Service(res));
	});
    }
    
    // Returns a list of the containers belonging to this service
    this.getContainers = function(callback) {
        var containerURIs = serviceJson.containers;
        
        var visit = function(conUris, containers) {
            var containerURI = conUris.pop();
            if (!containerURI) {
                callback(null, containers);
                return;
            }
            
            dockerCloudAPICall(containerURI, 'GET', null, (err, res) => {
                if (err) {callback(err); return;}
                containers.push(new Container(res));
                visit(conUris, containers);
            })
        }
        visit(containerURIs, []);
    }
}

// Constructor to make a container object from the json object returned from docker cloud
var Container = function(containerJson) {

    for (var k in containerJson) {
        this[k] = containerJson[k];
    }
    
    // returns json representation of the container
    this.toString = function() {
        return JSON.stringify(containerJson, null, 2);
    }
}


// API call to get list of nodes
exports.listNodes = function(callback) {
    dockerCloudAPICall("/api/infra/v1/node/", 'GET', null, callback);
}

// API call to get list of services
exports.listServices = function(callback) {
    dockerCloudAPICall("/api/app/v1/service/", 'GET', null, callback);
}

// API call to get a service from an uuid
exports.getService = function(uuid, callback) {
    dockerCloudAPICall("/api/app/v1/service/" + uuid + "/", 'GET', null, (err, res) => {
	if (err) {callback(err); return;}
	callback(null, new Service(res));
    });
}

// API call to create a service and returns a object representing it
exports.createService = function(options, callback) {
    if (options['image'] == null ||
	options['name'] == null ||
	options['target_num_containers'] == null) {
	callback("You need at least to supply image, name and target_num_containers" )
	return;
    }
    
    dockerCloudAPICall("/api/app/v1/service/", 'POST', options, (err, res) => {
	if (err) {callback(err); return;}
	callback(null, new Service(res));
    });
}

// API call to get list of containers
exports.listContainers = function(callback) {
    dockerCloudAPICall("/api/app/v1/container/", 'GET', null, (err, res) => {
        if (err) {callback(err); return;}
        
        var containers = [];
        for (var i = 0; i < res.objects.length; ++i) {
            containers.push(new Container(res.objects[i]));
        }
        callback(null, containers);
    });
}
