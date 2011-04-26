var convert = require(__dirname+'/conversionlib');

function PixelCore(){}

PixelCore.prototype = {
	//used in threshold transforms. kinda bad design i know but its late =)
	threshhold:50,
	iterate:function(canvas,cb){
		var ctx = canvas.getContext('2d')
		,frame = ctx.getImageData(0, 0, canvas.width, canvas.height),o={};
		
		for (var i = 0,l=frame.data.length/4; i < l; i++) {
			o.r = frame.data[i * 4 + 0];
			o.g = frame.data[i * 4 + 1];
			o.b = frame.data[i * 4 + 2];
			o.a = frame.data[i * 4 + 3];

			if(cb(o,i,l,frame.data,canvas.width, canvas.height,this) === false){
				break;
			}

			frame.data[i * 4 + 0] = o.r;
			frame.data[i * 4 + 1] = o.g;
			frame.data[i * 4 + 2] = o.b;
			frame.data[i * 4 + 3] = o.a;
		}
		
		ctx.putImageData(frame, 0, 0);
	},
	transforms:{
		grayscale:{
			lightness:function(px){
				px.r = px.g = px.b = (Math.max(px.r, px.g, px.b) + Math.min(px.r, px.g, px.b)) / 2;
			},
			average:function(px){
				px.r = px.g = px.b = (px.r + px.g + px.b) / 3;
			},
			luma:function(px){
				//BT709 - HD tv standard - http://en.wikipedia.org/wiki/Rec._709
				px.r = px.b = px.g = (0.2125*px.r + 0.7154*px.g + 0.0721*px.b);
			},
			lumaY:function(px){
				//(YIQ/NTSC) Red: 0.299 Green: 0.587 Blue: 0.114 
				px.r = px.b = px.g = (0.299*px.r + 0.587*px.g + 0.114*px.b);
			},
			lumaRMY:function(px){
				//Red: 0.5 Green: 0.419 Blue: 0.081
				//dont know where RMY comes from but it yeilds interesting results
				px.r = px.b = px.g = (0.5*px.r + 0.419*px.g + 0.081*px.b);
			}
		}/*, work in progress
		lumaThreshold:function(px,i,l,pixels,w,h,pixelCore){
			var luma = {r:px.r,g:px.g,b:px.b};
			this.grayscale.luminosity(luma);
			if(luma.r > pixelCore.threshold) {
				var hsl = convert.rgbToHsl(px.r,px.g,px.b);
			}
		}*/
	}
}

module.exports = PixelCore;