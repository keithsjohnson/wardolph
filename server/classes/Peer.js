var Peer = function(name, collectionName, searchKeywords){
		this.name = name;
		this.collectionName = collectionName;
		if(searchKeywords instanceof Array){
			this.searchKeywords = searchKeywords;
		}
		else{
			this.searchKeywords = [];
		}
	}

Peer.prototype.addKeyword = function(keyword){
	this.searchKeywords.push(keyword);
}

module.exports = Peer;