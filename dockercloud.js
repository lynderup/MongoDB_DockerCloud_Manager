var https = require('https');

var dockerCloudAPICall = function(path, method, data, callback) {
    var apikey = new Buffer("lynderup:19325cdc-d24f-47c3-a12b-85e4eaa8f358").toString('base64');

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


var Service = function(serviceJson) {
    var uuid = serviceJson.uuid;

    this.toString = function() {
        return JSON.stringify(serviceJson, null, 2);
    }

    this.start = function(callback) {
	dockerCloudAPICall("/api/app/v1/service/" + uuid + "/start/", 'POST', null, (err, res) => {
	    if (err != null) {
		callback(err);
		return;
	    }
	    callback(null, new Service(res));
	});
    }

    this.stop = function(callback) {
	dockerCloudAPICall("/api/app/v1/service/" + uuid + "/start/", 'POST', null, (err, res) => {
	    if (err != null) {
		callback(err);
		return;
	    }
	    callback(null, new Service(res));
	});
    }
    this.getContainers = function(callback) {
        var containerURIs = serviceJson.containers;
        
        var visit = function(conUris, containers) {
            var containerURI = conUris.pop();
            if (!containerURI) {
                callback(null, containers);
                return;
            }
            
            dockerCloudAPICall(containerURI, 'GET', (err, res) => {
                if (err != null) {
		    callback(err);
		    return;
	        }
                containers.push(new Container(res));
                visit(conUris, containers);
            })
        }
        visit(containerURIs, []);
    }
}


var Container = function(containerJson) {

    this.toString = function() {
        return JSON.stringify(containerJson, null, 2);
    }
}

exports.listNodes = function(callback) {
    dockerCloudAPICall("/api/infra/v1/node/", 'GET', null, callback);
}

exports.listServices = function(callback) {
    dockerCloudAPICall("/api/app/v1/service/", 'GET', null, callback);
}

exports.createService = function(options, callback) {
    if (options['image'] == null ||
	options['name'] == null ||
	options['target_num_containers'] == null) {
	callback("You need at least to supply image, name and target_num_containers" )
	return;
    }
    
    dockerCloudAPICall("/api/app/v1/service/", 'POST', options, (err, res) => {
	if (err != null) {
	    callback(err);
	    return;
	}

	callback(null, new Service(res));
	
    });
}

exports.listContainers = function(callback) {
    dockerCloudAPICall("/api/app/v1/container/", 'GET', null, callback);
}
