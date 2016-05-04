var Logger = function (file) {
    this.log = function(log) {

	console.log("["+file+"] " + log)
    };
};

module.exports = exports = Logger;
