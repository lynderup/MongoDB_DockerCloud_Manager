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
	    callback(JSON.parse(data), null);
	});
    });
    
    req.on('error', (e) => {
	callback(null, e);
    });

    if (method == 'POST') {
	req.write(postData);
    }
    
    req.end();
}


var Service = function(serviceJson) {
    var uuid = serviceJson.uuid;

    this.start = function(callback) {
	dockerCloudAPICall("/api/app/v1/service/" + uuid + "/start/", 'POST', null, (res, err) => {
	    if (err != null) {
		callback(null, err);
		return;
	    }
	    callback(new Service(res), null);
	});
    }

    this.stop = function(callback) {
	dockerCloudAPICall("/api/app/v1/service/" + uuid + "/start/", 'POST', null, (res, err) => {
	    if (err != null) {
		callback(null, err);
		return;
	    }
	    callback(new Service(res), null);
	});
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
	callback(null, "You need at least to supply image, name and target_num_containers" )
	return;
    }
    
    dockerCloudAPICall("/api/app/v1/service/", 'POST', options, (res, err) => {
	if (err != null) {
	    callback(null, err);
	    return;
	}

	callback(new Service(res), null);
	
    });
}

exports.listContainers = function(callback) {
    dockerCloudAPICall("/api/app/v1/container/", 'GET', null, callback);
}
