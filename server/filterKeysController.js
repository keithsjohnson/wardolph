var config = require('./conf');

var getKeywords = function(pageTitle){

	return config.client.filterData[pageTitle];

}

exports.getKeywords = getKeywords;