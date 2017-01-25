module.exports = function (positions, messages, latencies) {

	var endpoints = {
		position: require('./position.js')(positions),
		message:require('./message.js')(messages),
		general: require('./general.js')(positions),
		latency: require('./latency.js')(latencies)
	};
	return endpoints;

}