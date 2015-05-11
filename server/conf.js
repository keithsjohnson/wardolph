
var config = {};
config.twitter = {};

config.twitter.consumer_key = 'xxxx';
config.twitter.consumer_secret = 'xxxx';
config.twitter.access_token = 'xxxx';
config.twitter.access_token_secret = 'xxxx';

config.ip = '127.0.0.1';//local ip
config.jwtSecret = 'testSecret';

config.server = {};

config.server.production = false;
config.server.my_type = 'dev';//can be 'master' or 'peer' or 'dev'. Peer will try and connect to master using config below
config.server.master_name = 'localhost';//will resolve to ip address. Use ip address if you need to.
config.server.master_port = '3000';
config.server.peer_listen_port = '4000';//master will listen to peers on this port

config.peer = {};//peer will collect data. // master will be able to change peer properties below.
config.peer.name = 'peerFem';
config.peer.list_name = 'test';//'feminism';//list name to save data on
config.peer.keywords = ["feminism", "feminist", "women's rights", "gender crime"];//keywords to collect data on

module.exports = config;
