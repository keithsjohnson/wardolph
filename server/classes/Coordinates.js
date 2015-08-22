var Coordinates = function (lat,lng){
        this.lat = lat;
        this.lng = lng;
    }

Coordinates.prototype.toString = function(){
	return this.lat+','+this.lng;
}

module.exports = Coordinates;