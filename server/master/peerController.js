
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

var maxKeywords = 5;
var peers = {};

peers['peer1'] = new Peer('peer1','rentalcars');
peers['peer1'].addKeyword('rentalcars.com');
peers['peer1'].addKeyword('rentalcars');
peers['peer1'].addKeyword('carhire3000.com');
peers['peer1'].addKeyword('traveljigsaw');
peers['peer1'].addKeyword('rentalcars.');

peers['peer2'] = new Peer('peer2','holidayAutos');
peers['peer2'].addKeyword('holidayautos');

exports.setPeer = function(data) {
	peers[data.name] = new Peer(data.name,data.collectionName,data.searchKeywords);
}

exports.getPeers = function() {
	
	return peers;
}

exports.setPeers = function(data) {
	peers = {};
	for (key in data) {
		console.log('jzTest2',key,data[key]);
		var peerData = data[key];
		
		var peer = new Peer(peerData.name,peerData.collectionName);
		peers[peer.name] = peer;
		for(var i=0; i<peerData.searchKeywords.length && i<maxKeywords; i++){
			peer.addKeyword(peerData.searchKeywords[i]);
		}

	}

	/*peers['peer1'] = new Peer('peer1','rentalcars');
	peers['peer1'].addKeyword('rentalcars.com');
	peers['peer1'].addKeyword('12341234');
	peers['peer1'].addKeyword('carhire3000.com');
	peers['peer1'].addKeyword('traveljigsaw');
	peers['peer1'].addKeyword('rentalcars.');

	peers['peer3'] = new Peer('peer3','holidayAutos');
	peers['peer3'].addKeyword('holidayautos');*/

	//return peers;
}