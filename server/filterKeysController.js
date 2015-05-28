var config = require('./conf');

var getKeywords = function(topic){

	return config.client.filterData[topic];

}

exports.getKeywords = getKeywords;