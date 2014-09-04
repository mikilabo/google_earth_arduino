

$(function(){
	var socket = io.connect();

	//add comma in figure
	function addFigure(str) {
		var num = new String(str).replace(/,/g, "");
		while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
		return num;
	}

	//heading Str
	function headingStr(heading){	
		if( -11.25 < heading && heading <= 11.25 ){
			return "N(北)";
		}else if( 11.25 < heading && heading <= 33.75 ){
			return "NNE(北北東)";
		}else if( 33.75 < heading && heading <= 56.25 ){
			return "NE(北東)";
		}else if( 56.25 < heading && heading <= 78.25 ){
			return "ENE(東北東)";
		}else if( 78.25 < heading && heading <= 100.75 ){
			return "E(東)";
		}else if( 100.75 < heading && heading <= 123.25 ){
			return "ESE(東南東)";
		}else if( 123.25 < heading && heading <= 145.75 ){
			return "SE(東南)";
		}else if( 145.75 < heading && heading <= 168.25 ){
			return "SSE(南南東)";
		}else if( 168.25 < heading || heading <= -168.25 ){
			return "S(南)";
		}else if( -11.25 > heading && heading >= -33.75 ){
			return "NNW(北北西)";
		}else if( -33.75 > heading && heading >= -56.25 ){
			return "NW(北西)";
		}else if( -56.25 > heading && heading >= -78.25 ){
			return "WNW(西北西";
		}else if( -78.25 > heading && heading >= -100.75 ){
			return "W(西)";
		}else if( -100.75 > heading && heading >= -123.25 ){
			return "WSW(西南西)";
		}else if( -123.25 > heading && heading >= -145.75 ){
			return "WS(西南)";
		}else if( -145.75 > heading && heading >= -168.25 ){
			return "SSW(南南西";
		}
		return "";
	}

	/**
	 * default position
	 */
	function setDefaultPosition(){
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		//Back To Tokyo
		lookAt.setLatitude(35.41);
		lookAt.setLongitude(139.45);
		lookAt.setTilt(0);
		lookAt.setHeading(0);

		lookAt.setRange( 1000000 );

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);

		//screen reset
		$('#latitude').val(35.41);
        $('#longitude').val(139.45);
        $('#range').val("1,000,000");
        $('#heading').val(0);
        $('#tilt').val(0);
        $('#direction').val("N(北)");

		$('#position_str').css("font-weight", "bold");
		$('#heading_str').css("font-weight", "normal");
		$('#tilt_str').css("font-weight", "normal");

		//background
		$('.data-box-position').css("background-color", "skyblue");
		$('.data-box-heading').css("background-color", "white");
		$('.data-box-tilt').css("background-color", "white");
		$('.data-box-color').css("background-color", "white");

	}
	//Operation Button Action from server
    socket.on('emit_from_server_opebtn', function(data){	
		var timer = JSON.parse(data).timer;
		var type = JSON.parse(data).type;
		//console.log("timer = " + timer + " type = " + type);

		//change Focus	
		var a = $('#position_str').css("font-weight");
		var b = $('#heading_str').css("font-weight");
		var c = $('#tilt_str').css("font-weight");
		var d = $('#color_str').css("font-weight");
		////console.log("XX: " + a + " " + b + " " + c);

		// Get the current view.
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		if( a == "bold"){	
			//position
			var range; 
			if(type==2){
				// Zoom out depends on length of timer
				if(timer < 500 ){
					range = lookAt.getRange() * 1.005;
				}else if(timer < 2000 ){
					range = lookAt.getRange() * 1.01;
				}else if(timer < 2500 ){
					range = lookAt.getRange() * 1.05;
				}else if(timer < 3000 ){
					range = lookAt.getRange() * 1.1;
				}else if(timer < 3500 ){
					range = lookAt.getRange() * 1.15;
				}
				if(range >= 127000000){
					range = 127000000;
				}
			}else{
				//zoom in depends on length of timer
				if(timer < 500 ){
					range = lookAt.getRange() * 0.99;
				}else if(timer < 2000 ){
					range = lookAt.getRange() * 0.95;
				}else if(timer < 2500 ){
					range = lookA4.getRange() * 0.85;
				}else if(timer < 3000 ){
					range = lookAt.getRange() * 0.80;
				}else if(timer < 3500 ){
					range = lookAt.getRange() * 0.75;
				}
				if(range <= 50 ){
					range = 50;
				}
			}
			lookAt.setRange(range);
			$('#range').val(addFigure(range.toFixed(1)));
		}else if( b == "bold"){	
			//heading
			var heading, flag; 
			if(type==1){
				//anti clockwise
				flag = 1;
			}else{
				//clockwise 
				flag = -1;
			}
			if(timer < 500 ){
				heading = lookAt.getHeading() + (1 * flag);
			}else if(timer < 750 ){
				heading = lookAt.getHeading() + (3 * flag);
			}else{
				heading = lookAt.getHeading() + (5 * flag);
			}
			lookAt.setHeading(heading);
			$('#heading').val(addFigure(heading.toFixed(0)));
			$('#direction').val(headingStr(heading));
		}else if( c == "bold"){	
			//tile
			var tilt, flag; 
			if(type==2){
				// tilt up
				flag = -1;
			}else{
				// tilt down 
				flag = 1;
			}
			if(timer < 500 ){
				tilt = lookAt.getTilt() + (1 * flag);
			}else if(timer < 750 ){
				tilt = lookAt.getTilt() + (5 * flag);
			}else if(timer < 1000 ){
				tilt = lookAt.getTilt() + (10 * flag);
			}
			if(tilt >= 90 ){
				tilt = 90;
			}
			if(tilt <= 0 ){
				tilt = 0;
			}

			lookAt.setTilt(tilt);
			$('#tilt').val(addFigure(tilt.toFixed(0)));
		}else if( d == "bold"){	
			//
			if(timer < 20 ){
					var c1 = $('.color1').css("border-style");
					var c2 = $('.color2').css("border-style");
					var c3 = $('.color3').css("border-style");
					var c4 = $('.color4').css("border-style");
					console.log("a : [" + a + "]");
					console.log("b : [" + b + "]");
					console.log("c : [" + c + "]");
					console.log("d : [" + d + "]");
					if( c1 == "solid"){	
						console.log("hoge1");
						$('.color1').css("border", "1px");
						$('.color2').css("border", "2px");
						$('.color1').css("border-style", "none");
						$('.color2').css("border-style", "solid");
						$('body').css("background-color", "red");
					}else if( c2 == "solid"){
						console.log("hoge2");
						$('.color2').css("border", "1px");
						$('.color3').css("border", "2px");
						$('.color2').css("border-style", "none");
						$('.color3').css("border-style", "solid");
						$('body').css("background-color", "green");
					}else if( c3 == "solid"){
						console.log("hoge3");
						$('.color3').css("border", "1px");
						$('.color4').css("border", "2px");
						$('.color3').css("border-style", "none");
						$('.color4').css("border-style", "solid");
						$('body').css("background-color", "blue");
					}else if( c4 == "solid"){
						console.log("hoge4");
						$('.color4').css("border", "1px");
						$('.color1').css("border", "2px");
						$('.color4').css("border-style", "none");
						$('.color1').css("border-style", "solid");
						$('body').css("background-color", "snow");
					}
			}
		}

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);
    });

	//Control Button Action from server
    socket.on('emit_from_server_ctrlbtn', function(data){	
		var contButton = JSON.parse(data).contButton;
		console.log("XX: contButton = " + contButton);

		switch(contButton){
		 case 1:
			//change Focus	
			var a = $('#position_str').css("font-weight");
			var b = $('#heading_str').css("font-weight");
			var c = $('#tilt_str').css("font-weight");
			var d = $('#color_str').css("font-weight");
			//console.log("XX: " + a + " " + b + " " + c);
			if( a == "bold"){	
				//change bold position
				$('#position_str').css("font-weight", "normal");
				$('#heading_str').css("font-weight", "bold");
				$('#tilt_str').css("font-weight", "normal");
				$('#color_str').css("font-weight", "normal");

				//background
				$('.data-box-position').css("background-color", "white");
				$('.data-box-heading').css("background-color", "skyblue");
				$('.data-box-tilt').css("background-color", "white");
				$('.data-box-color').css("background-color", "white");
			}else if( b == "bold" ){
				//change bold position
				$('#position_str').css("font-weight", "normal");
				$('#heading_str').css("font-weight", "normal");
				$('#tilt_str').css("font-weight", "bold");
				$('#color_str').css("font-weight", "normal");

				//background
				$('.data-box-position').css("background-color", "white");
				$('.data-box-heading').css("background-color", "white");
				$('.data-box-tilt').css("background-color", "skyblue");
				$('.data-box-color').css("background-color", "white");
			}else if( c == "bold" ){
				//change bold position
				$('#position_str').css("font-weight", "normal");
				$('#heading_str').css("font-weight", "normal");
				$('#tilt_str').css("font-weight", "normal");
				$('#color_str').css("font-weight", "bold");

				//background
				$('.data-box-position').css("background-color", "white");
				$('.data-box-heading').css("background-color", "white");
				$('.data-box-tilt').css("background-color", "white");
				$('.data-box-color').css("background-color", "skyblue");
			}else{
				//change bold position
				$('#position_str').css("font-weight", "bold");
				$('#heading_str').css("font-weight", "normal");
				$('#tilt_str').css("font-weight", "normal");
				$('#color_str').css("font-weight", "normal");

				//background
				$('.data-box-position').css("background-color", "skyblue");
				$('.data-box-heading').css("background-color", "white");
				$('.data-box-tilt').css("background-color", "white");
				$('.data-box-color').css("background-color", "white");
			}
	
			break;
		 case 2:
			//set default position
			console.log("default by button");
			setDefaultPosition();
			break;
		 default:
			break;
		}
    });

	//Angle data from server
    socket.on('emit_from_server_angle', function(data){
        //console.log("length : " + data);
		var angleX = JSON.parse(data).accXangle;
		var angleY = JSON.parse(data).accYangle;

        $('#angleX').val(angleX);
        $('#angleY').val(angleY);

		ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE);
		//var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		var latitude = lookAt.getLatitude();
		var longitude = lookAt.getLongitude();
		var range    = lookAt.getRange();

		//console.log("angleX:" + angleX + " angleY:" + angleY );
		//console.log("A la: " + latitude + " lo;" + longitude + " ra:" + range );

		var factor = getMoveScale(range);
		//console.log("factor = " + factor );

		var latitude_delta, longitude_delta;

		//X Angle
		var xFlag = -1;
		if(angleX < 0){
			xFlag = 1;
		}
		angleX = Math.abs(angleX);
		if( angleX < 5 ){
			latitude_delta = 0;
		}else if( angleX < 15){
			latitude_delta = (factor * 0.5 * xFlag) ;
		}else if( angleX < 35){
			latitude_delta = (factor * 1.5 * xFlag) ;
		}else if( angleX < 60){
			latitude_delta = (factor * 3.0 * xFlag) ;
		}else{
			latitude_delta = (factor * 5.0 * xFlag) ;
		}

		//Y Angle
		var yFlag = -1;
		if(angleY < 0){
			yFlag = 1;
		}
		angleY = Math.abs(angleY);
		if( angleY < 5 ){
			longitude_delta = 0;
		}else if( angleY < 15){
			longitude_delta = (factor * 0.5 * yFlag) ;
		}else if( angleY < 35){
			longitude_delta = (factor * 1.5 * yFlag) ;
		}else if( angleY < 60){
			longitude_delta = (factor * 3.0 * yFlag) ;
		}else{
			longitude_delta = (factor * 5.0 * yFlag) ;
		}

		//console.log("1: latitude_delta = " + latitude_delta + " longitude_delta = " + longitude_delta);

		//heading
		//latitude->緯度 longitude->経度
		var heading = lookAt.getHeading();
		//console.log("heading = " + heading);
		if( heading < -1 && heading > -90){
			var a = 90 + (heading);

			var cos = Math.cos(a*(Math.PI/180));
			var sin = Math.sin(a*(Math.PI/180));

			//console.log("11: a = " + a + " cos = " + cos + " sin = " + sin);

			latitude_delta = latitude_delta * cos + longitude_delta * sin;
			longitude_delta = -latitude_delta * sin +  longitude_delta * cos;
		}
		//console.log("2: latitude_delta = " + latitude_delta + " longitude_delta = " + longitude_delta);

		latitude = latitude + latitude_delta;
		longitude = longitude + longitude_delta;

		//西に移動して経度が-180以下になった場合の微調整,
 	    //東に移動して180を超えた場合は自動で-180になるらしい…
		if( longitude < -180 ){
			longitude = 180 + (longitude+180)
			//console.log("new longitude = " + longitude);
		}

		//console.log("B la: " + latitude + " lo:" + longitude + " ra:" + range );

		// Update the view in Google Earth.
		lookAt.setLatitude(latitude);
		lookAt.setLongitude(longitude);
		//lookAt.setRange(range);
		ge.getView().setAbstractView(lookAt);

		//showing to web
		$('#latitude').val(latitude.toFixed(4));
        $('#longitude').val(longitude.toFixed(4));
        //$('#range').val(addFigure(range.toFixed(2)));


		//Set Heading Str
		var lookAt2 = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
		heading = lookAt2.getHeading();
		$('#heading').val(addFigure(heading.toFixed(0)));
		$('#direction').val(headingStr(heading));


		/* for DEBUG */
/***
		//var lookAt2 = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
		var lookAt2 = ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE);
		var latitude2 = lookAt2.getLatitude();
		var longitude2 = lookAt2.getLongitude();
		var range2    = lookAt2.getRange();
		console.log("C la: " + latitude2 + " lo:" + longitude2 +
					" ra:" + range2 );
***/
    });


	$('#default').click(function() {
		console.log(ge.getView());
		setDefaultPosition();
  	});
	$('#east').click(function() {
		ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);

		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		// Add 25 degrees to the current latitude and longitude values.
		lookAt.setLongitude(lookAt.getLongitude() + 25.0);

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);

  	});
	$('#west').click(function() {
		ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		// Add 25 degrees to the current latitude and longitude values.
		lookAt.setLongitude(lookAt.getLongitude() - 25.0);

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);
  	});
	$('#north').click(function() {
		ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);

		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		// Add 25 degrees to the current latitude 
		lookAt.setLatitude(lookAt.getLatitude() + 25.0);

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);

  	});
	$('#south').click(function() {
		ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		lookAt.setLatitude(lookAt.getLatitude() - 25.0);

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);
  	});


	$('#Zoomin').click(function() {
		// Get the current view.
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		// Zoom out to twice the current range.
		var range = lookAt.getRange() * 0.5;
		lookAt.setRange(range);

        $('#range').val(addFigure(range.toFixed(0)));

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);

  	});
	$('#Zoomout').click(function() {
		// Get the current view.
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		// Zoom out to twice the current range.
		var range = lookAt.getRange() * 2.0;
		lookAt.setRange(range);
        $('#range').val(addFigure(range.toFixed(0)));

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);
  	});
	$('#Tiltup').click(function() {
		// Get the current view.
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		// setTilt
		lookAt.setTilt(lookAt.getTilt() - 30);

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);
  	});
	$('#Tiltdown').click(function() {
		// Get the current view.
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		// setTilt
		lookAt.setTilt(lookAt.getTilt() + 30);

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);
  	});
	$('#Clockwise').click(function() {
		// Get the current view.
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		// setHeading
		lookAt.setHeading(lookAt.getHeading() - 20);

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);
  	});
	$('#CounterClockwise').click(function() {
		// Get the current view.
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		// setHeading
		lookAt.setHeading(lookAt.getHeading() + 20);

		// Update the view in Google Earth.
		ge.getView().setAbstractView(lookAt);
  	});



	/**
	 * getting move amount from range
	 */	
	function getMoveScale(range){
			if( range < 500 ){
				return 0.00008;
			}else if( range < 1000 ){
				return 0.00025;
			}else if( range < 5000 ){
				return 0.0005;
			}else if( range < 10000 ){
				return 0.0015;
			}else if( range < 30000 ){
				return 0.0025;
			}else if( range < 50000 ){
				return 0.005;
			}else if( range < 150000 ){
				return 0.01;
			}else if( range < 750000 ){
				return 0.1;
			}else if( range < 1500000 ){
				return 0.5;
			}
			return 1;
	}
});


