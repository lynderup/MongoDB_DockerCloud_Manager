var Logger = function (file) {
    this.log = function(log) {

	console.log("["+file+"] " + log)
    };
};

exports.Logger = Logger;
