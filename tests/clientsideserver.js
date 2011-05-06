var express = require('express')
	,app = express.createServer()
	,fs = require('fs')
	,Canvas = require('canvas')
	,core = require(__dirname+'/../app.js');
	

app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(express.static(__dirname + '/fixtures/'));
});

app.get('/', function(req, res){
	fs.readFile(__dirname+'/fixtures/test.html', function (err, data) {
		res.send(data?data.toString():err);
	});
});

app.get('/conversionlib.js', function(req, res){
	fs.readFile(__dirname+'/../lib/conversionlib.js', function (err, data) {
		res.send(data?data.toString():err);
	});
});

app.get('/core.js', function(req, res){
	fs.readFile(__dirname+'/../lib/core.js', function (err, data) {
		res.send(data?data.toString():err);
	});
});

app.get('/generate', function(req, res){
	var px = new core.PixelCore();
	

	var img = new Canvas.Image()
	,q = req.query;
	
	if(!q.transform || !px.transforms[q.transform]) {
		res.send('valid transform required');
		return;
	}
	
	if(!q.type || !px.transforms[q.transform][q.type]) {
		res.send('valid transform type required');
		return;
	}
	
	if(!q.file || q.file.lastIndexOf('.png') != q.file.length-4) {
		res.send('png file required');
		return;
	}
	
	fs.stat(__dirname+'/fixtures/'+q.file,function(err,stat){
		if(err) {
			res.send('file must exist');
			return;
		}
		
		img.onload = function(){
			try{
				var canvas = new Canvas(img.width,img.height);
				var ctx = canvas.getContext('2d'),s;
				ctx.drawImage(img,0,0);
				
				//s = Date.now();
				px.iterate(canvas,px.transforms[q.transform][q.type]);
				//console.log((Date.now()-s)+'ms');
				
				canvas.toBuffer(function(err, buf){
					
					if(err) {
						console.log(err);
						res.send('error!');
						return;
					}
					
					res.header('Content-Type','image/png');
					res.send(buf);
				});
			}catch(e){
				console.log(e);
				res.send('ERROR: '+e.message);
			}
		};
		
		img.src = __dirname+'/fixtures/'+q.file;
	});
	/*

	*/
});

app.error(function(err, req, res){
	console.log(err);
	res.send(err+'');
});


app.listen(3031);
console.log('listening on 3031');
