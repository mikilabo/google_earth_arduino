//initialization
var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	fs = require('fs'),
	path = require('path'),
	serialport = require('serialport');

//debug level
io.set('log level', 1);

// Serial Port
var portName = '/dev/cu.usbserial-AD0267I2'; // My Mac environment
var sp = new serialport.SerialPort(portName, {
    baudRate: 38400,
    parser: serialport.parsers.readline("\n"),
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
});

//port setting
app.listen(3000);

//web server handler
function handler(req, res){

	var filePath = req.url;

	if (filePath == '/') {
	    filePath = '/index.html';
	} else {
 	    filePath = req.url;
	}
	//console.log(filePath);
	var extname = path.extname(filePath);
	//console.log("filePath: " + filePath);
	//console.log("ext: " + extname);

	//contentType switch
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}
	console.log(contentType);

	//console.log(__dirname + filePath);
	fs.readFile(__dirname + filePath, function(err, data){
		if(err){
			res.writeHead(500);
			return res.end('Error');
		}
		res.setHeader('Content-Type', contentType);
		res.writeHead(200);
		res.write(data);
		res.end();
	});
}

//data from serialport(arduino)
//加速度計からのデータ入力
sp.on('data', function(data) {
	console.log('serialpor data received: ' + data);
	try{
		var ctrl = JSON.parse(data).ctrl;
		//console.log("ctrl = " + ctrl);

		switch(ctrl){
		 case 1:
			//control button 
			//var contButton = JSON.parse(data).contButton;
			//console.log("contBtn = " + contButton);
			io.sockets.emit('emit_from_server_ctrlbtn', data);
			break;
		 case 2:
			//operation button
			//var timer = JSON.parse(data).timer;
			//var type = JSON.parse(data).type;
			//console.log("timer = " + timer + " type = " + type);
			io.sockets.emit('emit_from_server_opebtn', data);
			break;
		 case 3:
			//Angle Data
			//var angleX = JSON.parse(data).accXangle;
			//var angleY = JSON.parse(data).accYangle;
			//console.log("x = " + angleX + ", y = " + angleY);
			io.sockets.emit('emit_from_server_angle', data);
			break;
		 defautl:
			break;
	   }

	}catch(e){
		//eat it;
		console.log(e);
	}
});


sp.on('close', function(err) {
    console.log('port closed');
});

//serialport open
sp.open(function () {
  console.log('port open');
});
