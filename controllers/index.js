module.exports = function (positions, messages, files, latencies) {

	var endpoints = {
		position: require('./position.js')(positions),
		message:require('./message.js')(messages),
		upload:require('./upload.js')(files),
		general: require('./general.js')(positions),
		latency: require('./latency.js')(latencies)
	};
	return endpoints;

}