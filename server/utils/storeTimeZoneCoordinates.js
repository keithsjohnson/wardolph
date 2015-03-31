var mongo = require('mongodb');
var config = require('../conf');
// var util = require('util');

var mongoClient = mongo.MongoClient;
    
var TDataObj = function (date,type,sentiment,tweet){
                        this.date = date;
                        this.type = type;
                        this.sentiment = sentiment;
                        this.tweet = tweet;
                    };

var TimeZoneObj = function (name,lat,lng,locationName){
                        this.name = name;
                        this.lat = lat;
                        this.lng = lng;
                        this.locationName = locationName;//this is name of the actual location where we go the coordinates from.
                    };

var rawData = [
  ["Central Time (US & Canada)",37.09024,-95.71289100000001,"United States"],
  ["London",51.5073509,-0.12775829999998223,"London, UK"],
  ["Pacific Time (US & Canada)",37.09024,-95.71289100000001,"United States"],
  ["Atlantic Time (Canada)",56.130366,-106.34677099999999,"Canada"],
  ["Arizona",34.0489281,-111.09373110000001,"Arizona, USA"],
  ["Quito",-0.1806532,-78.46783820000002,"Quito, Ecuador"],
  ["Amsterdam",52.3702157,4.895167899999933,"Amsterdam, Netherlands"],
  ["Casablanca",33.5731104,-7.589843400000063,"Casablanca, Morocco"],
  ["New Delhi",28.6139391,77.20902120000005,"New Delhi, Delhi, India"],
  ["Mountain Time (US & Canada)",37.09024,-95.71289100000001,"United States"],
  ["Athens",37.983917,23.729359899999963,"Athens, Greece"],
  ["Hawaii",19.8967662,-155.58278180000002,"Hawaii, USA"],
  ["Sydney",-33.8674869,151.20699020000006,"Sydney NSW, Australia"],
  ["Chennai",13.0826802,80.27071840000008,"Chennai, Tamil Nadu, India"],
  ["Islamabad",33.7293882,73.09314610000001,"Islamabad, Pakistan"],
  ["Mumbai",19.0759837,72.87765590000004,"Mumbai, Maharashtra, India"],
  ["Istanbul",41.00527,28.976959999999963,"İstanbul, Turkey"],
  ["Brasilia",-14.235004,-51.92527999999999,"Brazil"],
  ["Alaska",64.2008413,-149.4936733,"Alaska, USA"],
  ["Stockholm",59.32932349999999,18.068580800000063,"Stockholm, Sweden"],
  ["Paris",48.856614,2.3522219000000177,"Paris, France"],
  ["Baghdad",33.325,44.422000000000025,"Baghdad, Iraq"],
  ["Greenland",71.706936,-42.604303000000016,"Greenland"],
  ["Karachi",24.8614622,67.00993879999999,"Karachi, Pakistan"],
  ["Belgrade",44.786568,20.44892159999995,"Belgrade, Serbia"],
  ["Rome",41.9027835,12.496365500000024,"Rome, Italy"],
  ["Ljubljana",46.0569465,14.505751499999974,"Ljubljana, Slovenia"],
  ["Kolkata",22.572646,88.36389499999996,"Kolkata, West Bengal, India"],
  ["Beijing",39.904211,116.40739499999995,"Beijing, Beijing, China"],
  ["Dublin",53.3498053,-6.260309699999993,"Dublin, Ireland"],
  ["Tijuana",32.5149469,-117.03824710000004,"Tijuana, Baja California, Mexico"],
  ["Bangkok",13.7563309,100.50176510000006,"Bangkok, Thailand"],
  ["Kuala Lumpur",3.139003,101.68685499999992,"Kuala Lumpur, Federal Territory of Kuala Lumpur, Malaysia"],
  ["Santiago",-33.4691199,-70.641997,"Santiago, Santiago Metropolitan Region, Chile"],
  ["Madrid",40.4167754,-3.7037901999999576,"Madrid, Madrid, Spain"],
  ["Singapore",1.352083,103.81983600000001,"Singapore"],
  ["Melbourne",28.0836269,-80.60810889999999,"Melbourne, FL, USA"],
  ["Brisbane",-27.4710107,153.02344889999995,"Brisbane QLD, Australia"],
  ["Edinburgh",55.953252,-3.188266999999996,"Edinburgh, City of Edinburgh, UK"],
  ["Kyiv",50.4501,30.523400000000038,"Kyiv, Kyiv city, Ukraine"],
  ["Berlin",52.52000659999999,13.404953999999975,"Berlin, Germany"],
  ["Buenos Aires",-34.6037232,-58.38159310000003,"Buenos Aires, Argentina"],
  ["Mazatlan",23.2494148,-106.41114249999998,"Mazatlán, Sin., Mexico"],
  ["Mid-Atlantic",40.2164079,-73.27653609999999,"New York/New Jersey Bight"],
  ["Jakarta",-6.2087634,106.84559899999999,"Jakarta, Special Capital Region of Jakarta, Indonesia"],
  ["Pretoria",-25.746111,28.18805599999996,"Pretoria, South Africa"],
  ["Tokyo",35.6894875,139.69170639999993,"Tokyo, Japan"],
  ["West Central Africa",2.3184621,19.56871030000002,"Central Africa"],
  ["Seoul",37.566535,126.97796919999996,"Seoul, South Korea"],
  ["Caracas",10.4696404,-66.8037185,"Caracas, Venezuela"],
  ["Indiana (East)",40.2671941,-86.13490189999999,"Indiana, USA"],
  ["Irkutsk",52.28697409999999,104.30501830000003,"Irkutsk, Irkutsk Oblast, Russia"],
  ["Lisbon",38.7222524,-9.139336599999979,"Lisbon, Portugal"],
  ["Bern",46.9479222,7.444608499999958,"Bern, Switzerland"],
  ["Hong Kong",22.396428,114.10949700000003,"Hong Kong"],
  ["Brussels",50.8503396,4.351710300000036,"Brussels, Belgium"],
  ["Canberra",-35.2819998,149.12868430000003,"Canberra ACT 2601, Australia"],
  ["Abu Dhabi",24.466667,54.36666700000001,"Abu Dhabi - Abu Dhabi - United Arab Emirates"],
  ["Nairobi",-1.2920659,36.82194619999996,"Nairobi, Kenya"],
  ["Urumqi",43.825592,87.616848,"Urumqi, Xinjiang, China"],
  ["Mexico City",19.4326077,-99.13320799999997,"Mexico City, Federal District, Mexico"],
  ["Central America",12.7690126,-85.60236429999998,"Central America"],
  ["Wellington",-41.2864603,174.77623600000004,"Wellington, New Zealand"],
  ["Copenhagen",55.6760968,12.568337100000008,"Copenhagen, Denmark"],
  ["Perth",-31.9535132,115.85704710000005,"Perth WA, Australia"],
  ["Adelaide",-34.92862119999999,138.5999594,"Adelaide SA, Australia"],
  ["Cairo",30.0444196,31.23571160000006,"Cairo, Cairo Governorate, Egypt"],
  ["Tehran",35.696111,51.423055999999974,"Tehran, Tehran, Iran"],
  ["New Caledonia",-20.904305,165.61804200000006,"New Caledonia"],
  ["Jerusalem",31.768319,35.21370999999999,"Jerusalem, Israel"],
  ["Vienna",48.2081743,16.37381890000006,"Vienna, Austria"],
  ["Helsinki",60.17332440000001,24.941024800000037,"Helsinki, Finland"],
  ["America/New_York",40.7127837,-74.00594130000002,"New York, NY, USA"],
  ["Bogota",4.598056000000001,-74.07583299999999,"Bogotá, Bogota, Colombia"],
  ["Auckland",-36.8484597,174.76333150000005,"Auckland, New Zealand"],
  ["Yakutsk",62.03333299999999,129.73333300000002,"Yakutsk, Sakha Republic, Russia"],
  ["Bucharest",44.4267674,26.102538399999958,"Bucharest, Romania"],
  ["Solomon Is.",38.9194442,-97.37113699999998,"Solomon, KS 67480, USA"],
  ["Warsaw",52.2296756,21.012228700000037,"Warsaw, Poland"],
  ["Riyadh",24.633333,46.71666700000003,"Riyadh Saudi Arabia"],
  ["Newfoundland",41.3073102,-75.31990350000001,"Newfoundland, PA 18445, USA"],
  ["Harare",-17.863889,31.029721999999992,"Harare, Zimbabwe"],
  ["America/Chicago",41.8781136,-87.62979819999998,"Chicago, IL, USA"],
  ["America/Los_Angeles",34.0522342,-118.2436849,"Los Angeles, CA, USA"],
  ["Yerevan",40.183333,44.516666999999984,"Yerevan, Armenia"],
  ["International Date Line West",0,-179.5,"International Date Line"],
  ["Kuwait",29.31166,47.48176599999999,"Kuwait"],
  ["Zagreb",45.8150108,15.981919000000062,"Zagreb, Croatia"],
  ["America/Toronto",40.4642335,-80.60090579999996,"Toronto, OH, USA"],
  ["Europe/London",51.5073509,-0.12775829999998223,"London, UK"],
  ["Fiji",-17.713371,178.06503199999997,"Fiji"],
  ["Baku",40.40926169999999,49.86709240000005,"Baku, Azerbaijan"],
  ["Moscow",55.755826,37.6173,"Moscow, Russia"],
  ["Midway Island",28.2100759,-177.37611049999998,"Midway Island, United States"],
  ["Georgetown",30.6332618,-97.67798419999997,"Georgetown, TX, USA"],
  ["La Paz",-16.5,-68.14999999999998,"Nuestra Señora de La Paz, Bolivia"],
  ["Budapest",47.497912,19.04023499999994,"Budapest, Hungary"],
  ["Monterrey",25.6866142,-100.3161126,"Monterrey, Nuevo Leon, Mexico"],
  ["Prague",50.0755381,14.43780049999998,"Prague, Czech Republic"],
  ["Lima",-12.046374,-77.0427934,"Lima, Peru"],
  ["Monrovia",6.313333,-10.801388999999972,"Monrovia, Liberia"],
  ["Taipei",25.0329694,121.56541770000001,"Taipei, Taiwan"],
  ["Sofia",42.6977082,23.321867500000053,"Sofia, Bulgaria"],
  ["Muscat",23.61,58.539999999999964,"Muscat, Oman"],
  ["Nuku'alofa",-21.133333,-175.2,"Nuku'alofa, Tonga"],
  ["EST",3.950512799999999,13.914399000000003,"East, Cameroon"],
  ["Saskatchewan",52.9399159,-106.4508639,"Saskatchewan, Canada"],
  ["Hobart",-42.8819032,147.32381480000004,"Hobart TAS, Australia"],
  ["Vilnius",54.6871555,25.279651400000034,"Vilnius Map, Lithuania"],
  ["Almaty",43.2220146,76.8512485,"Almaty, Kazakhstan"],
  ["Osaka",34.6937378,135.50216509999996,"Osaka, Osaka Prefecture, Japan"],
  ["Guam",13.444304,144.79373099999998,"Guam"],
  ["Riga",56.9496487,24.10518639999998,"Rīga, Latvia"],
  ["Chihuahua",28.6329957,-106.06910040000002,"Chihuahua, Chihuahua, Mexico"],
  ["Krasnoyarsk",56.01528339999999,92.8932476,"Krasnoyarsk, Krasnoyarsk Krai, Russia"],
  ["Guadalajara",20.6596988,-103.34960920000003,"Guadalajara, Jalisco, Mexico"],
  ["Kabul",34.533333,69.16666699999996,"Kabul, Afghanistan"],
  ["Darwin",-12.4628271,130.84177720000002,"Darwin NT, Australia"],
  ["Azores",37.7412488,-25.675594400000023,"Azores, Portugal"],
  ["Bratislava",48.1458923,17.107137299999977,"Bratislava, Slovakia"],
  ["Minsk",53.90453979999999,27.561524400000053,"Minsk, Belarus"],
  ["Skopje",41.9973462,21.42799560000003,"Skopje, Macedonia (FYROM)"],
  ["Tallinn",59.43696079999999,24.75357459999998,"Tallinn, Estonia"],
  ["Dhaka",23.810332,90.41251809999994,"Dhaka, Bangladesh"],
  ["Sarajevo",43.8562586,18.413076300000057,"Sarajevo, Bosnia and Herzegovina"],
  ["CST",30.288951,-89.73041999999998,"CST, 2240 Gause Boulevard East, Slidell, LA 70461, USA"],
  ["Kathmandu",27.7,85.33333300000004,"Kathmandu 44600, Nepal"],
  ["America/Denver",39.7392358,-104.990251,"Denver, CO, USA"],
  ["America/Detroit",42.331427,-83.0457538,"Detroit, MI, USA"],
  ["Samoa",-13.759029,-172.104629,"Samoa"],
  ["Sri Jayawardenepura",6.8940701,79.90247790000001,"Sri Jayawardenepura Kotte, Sri Lanka"],
  ["Cape Verde Is.",15.120142,-23.605172100000004,"Cape Verde"],
  ["Novosibirsk",55.00835259999999,82.93573270000002,"Novosibirsk, Novosibirsk Oblast, Russia"],
  ["Hanoi",21.0277644,105.83415979999995,"Hanoi, Hoàn Kiếm, Hanoi, Vietnam"],
  ["Europe/Istanbul",41.00527,28.976959999999963,"İstanbul, Turkey"],
  ["Ekaterinburg",56.83892609999999,60.60570250000001,"Yekaterinburg, Sverdlovsk Oblast, Russia"],
  ["PST",52.42186239999999,16.91759000000002,"Poznański Szybki Tramwaj, Poznań, Poland"],
  ["Volgograd",48.7,44.516666999999984,"Volgograd, Volgograd Oblast, Russia"],
  ["Africa/Nairobi",-1.2920659,36.82194619999996,"Nairobi, Kenya"],
  ["Rangoon",16.780833,96.149722,"Yangon, Republic of the Union of Myanmar"],
  ["Asia/Calcutta",22.572646,88.36389499999996,"Kolkata, West Bengal, India"],
  ["UTC",30.2830485,-97.73880639999999,"The University Teaching Center, The University of Texas at Austin, Austin, TX 78705, USA"],
  ["Kiev",50.4501,30.523400000000038,"Kyiv, Kyiv city, Ukraine"],
  ["GMT",-15.7065186,-47.90595229999997,"Gmt, Brasília - DF, Brazil"],
  ["America/Atikokan",48.757169,-91.62552099999999,"Atikokan, ON P0W, Canada"],
  ["Tbilisi",41.716667,44.78333299999997,"Tbilisi, Georgia"],
  ["Tashkent",41.266667,69.21666700000003,"Tashkent, Uzbekistan"],
  ["America/Boise",43.6187102,-116.21460680000001,"Boise, ID, USA"],
  ["America/Halifax",41.99121299999999,-70.861985,"Halifax, MA, USA"],
  ["Magadan",59.566667,150.79999999999995,"Magadan, Magadan Oblast, Russia"],
  ["Ulaan Bataar",47.91999999999999,106.92000000000007,"Ulaanbaatar, Mongolia"],
  ["BST",44.410337,-69.0110598,"Belfast Municipal Airport (BST), Little River Drive, Belfast, ME 04915, USA"],
  ["St. Petersburg",59.9342802,30.335098600000038,"Saint Petersburg, Russia"],
  ["Eire",53.41291,-8.243889999999965,"Ireland"],
  ["Asia/Kolkata",22.572646,88.36389499999996,"Kolkata, West Bengal, India"],
  ["Asia/Kuala_Lumpur",3.139003,101.68685499999992,"Kuala Lumpur, Federal Territory of Kuala Lumpur, Malaysia"],
  ["America/Anchorage",61.2180556,-149.90027780000003,"Anchorage, AK, USA"],
  ["CET",38.9070361,-77.044309,"CET, 1920 N Street Northwest #200, Washington, DC 20036, USA"],
  ["America/Argentina/Buenos_Aires",-34.6037232,-58.38159310000003,"Buenos Aires, Argentina"],
  ["MST",50.9123516,5.765991100000065,"Maastricht Aachen Airport (MST), Vliegveldweg 90, 6199 AD Maastricht-Airport, Netherlands"],
  ["Asia/Karachi",24.8614622,67.00993879999999,"Karachi, Pakistan"],
  ["Australia/Sydney",-33.8674869,151.20699020000006,"Sydney NSW, Australia"],
  ["Marshall Is.",48.36535199999999,-96.67442399999999,"Marshall County, MN, USA"],
  ["Europe/Helsinki",60.17332440000001,24.941024800000037,"Helsinki, Finland"],
  ["Europe/Dublin",53.3498053,-6.260309699999993,"Dublin, Ireland"],
  ["America/Phoenix",33.4483771,-112.07403729999999,"Phoenix, AZ, USA"],
  ["Sapporo",43.0620958,141.3543763,"Sapporo, Hokkaido Prefecture, Japan"],
  ["America/Edmonton",36.9800563,-85.61219059999996,"Edmonton, KY 42129, USA"],
  ["America/Belem",-1.4557549,-48.49017989999999,"Belém - PA, Brazil"],
  ["Asia/Manila",14.5995124,120.9842195,"Manila, Metro Manila, Philippines"],
  ["America/Regina",36.1841855,-106.95670819999998,"Regina, NM, USA"],
  ["Europe/Malta",35.937496,14.375415999999973,"Malta"],
  ["America/Jamaica",40.702677,-73.78896889999999,"Jamaica, Queens, NY, USA"],
  ["JST",40.316111,-78.833889,"Johnstown Regional Airport (JST), 479 Airport Road, Johnstown, PA 15904, USA"],
  ["America/Vancouver",45.6387281,-122.66148609999999,"Vancouver, WA, USA"],
  ["Europe/Berlin",52.52000659999999,13.404953999999975,"Berlin, Germany"],
  ["Pacific/Auckland",-36.9206113,174.83890969999993,"Pacific Rise, Mount Wellington, Auckland 1060, New Zealand"],
  ["Africa/Johannesburg",-26.2041028,28.047305100000017,"Johannesburg, South Africa"],
  ["America/Manaus",-3.1190275,-60.02173140000002,"Manaus - AM, Brazil"],
  ["America/Santiago",-33.4691199,-70.641997,"Santiago, Santiago Metropolitan Region, Chile"],
  ["Asia/Tokyo",35.7090259,139.73199249999993,"Tokyo, Japan"],
  ["Europe/Belfast",54.59728500000001,-5.930119999999988,"Belfast, Belfast, UK"],
  ["Africa/Accra",5.55,-0.20000000000004547,"Accra, Ghana"],
  ["AST",46.1557713,-123.88192179999999,"Astoria Regional Airport (AST), 1110 Southeast Flightline Drive, Warrenton, OR 97146, USA"],
  ["America/Montevideo",-34.9011127,-56.16453139999999,"Montevideo, Uruguay"],
  ["Vladivostok",43.133333,131.89999999999998,"Vladivostok, Primorsky Krai, Russia"],
  ["Europe/Stockholm",59.32932349999999,18.068580800000063,"Stockholm, Sweden"],
  ["Astana",51.16052269999999,71.4703558,"Astana 020000, Kazakhstan"],
  ["Europe/Amsterdam",52.3702157,4.895167899999933,"Amsterdam, Netherlands"],
  ["Kamchatka",61.43439809999999,166.78841310000007,"Kamchatka Krai, Russia"],
  ["Canada/Eastern",45.4148457,-64.30219190000003,"Eastern Avenue, Parrsboro, NS, Canada"],
  ["Africa/Cairo",30.0444196,31.23571160000006,"Cairo, Cairo Governorate, Egypt"],
  ["America/Asuncion",-25.282197,-57.635099999999966,"Asuncion, Paraguay"],
  ["Europe/Copenhagen",55.6760968,12.568337100000008,"Copenhagen, Denmark"],
  ["Asia/Qatar",25.354826,51.183884000000035,"Qatar"],
  ["America/Dawson",31.7735001,-84.4465826,"Dawson, GA 39842, USA"],
  ["America/Resolute",61.9652085,-150.07904459999997,"Resolute Drive, Willow, AK 99688, USA"],
  ["Africa/Lagos",6.5243793,3.379205700000057,"Lagos, Nigeria"],
  ["Asia/Makassar",-5.1308551,119.41652840000006,"Makassar City, Makassar City, South Sulawesi, Indonesia"]
]

// Connect to the db //strat mango db before trying to connect.
mongoClient.connect("mongodb://"+config.ip+":27017/wardolph", function(err, db) {
      if(!err) {
        console.log("mongodb: We are connected");
        var timezoneCollection = db.collection('timezone');//save here
        

        //timezoneCollection.drop();
        
        for (var i = 0; i < rawData.length; i++) {
            var time = rawData[i];
            var myTimeObj = new TimeZoneObj(time[0],time[1],time[2],time[3]);
            //console.log("storing: "+time);
            timezoneCollection.insert(myTimeObj, { w: 1 }, function(err, result) {console.log("err: "+err)});

        }
        
                	
        console.log("---end---data stored---")

        
        

      }
      else{
          console.log("mongodb error connecting: "+err);
      }
});