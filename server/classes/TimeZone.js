var Coordinates = require('./Coordinates');

var TimeZone = function (name,lat,lng,locationName){
                        this.name = name;
                        this.coordinates = new Coordinates(lat,lng);
                        this.locationName = locationName;//this is name of the actual location where we got the coordinates from.
                    };

module.exports = TimeZone;