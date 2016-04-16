var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();
 
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});
 
client.on('connect', function(connection) {
    
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });

    var test = {
	node : 'test'
    };
    connection.sendUTF(JSON.stringify(test));
    
});


var test = new Buffer("lynderup:19325cdc-d24f-47c3-a12b-85e4eaa8f358").toString('base64');
console.log(test);
client.connect('wss://ws.cloud.docker.com/api/audit/v1/events',
	       null, null,
	       {'Authorization' : 'Basic ' + test},
	       null);
