module.exports = function (positions, messages, files) {

	var endpoints = {
		position: require('./position.js')(positions),
		message:require('./message.js')(messages),
		upload:require('./upload.js')(files),
		general: require('./general.js')(positions)
	};
	return endpoints;

}