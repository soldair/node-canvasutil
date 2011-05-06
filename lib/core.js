var convert = require(__dirname+'/conversionlib');

function PixelCore(){}

PixelCore.prototype = {
	//used in threshold transforms.
	threshold:50,
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
		},
		//brightens everything below a threshold to threshold
		brightenThreshold:function(px,i,l,pixels,w,h,pixelCore){
			var hsl = convert.rgbToHsl(px.r,px.g,px.b),rgb;

			if(hsl[1] < pixelCore.threshold/100) {
				//http://en.wikipedia.org/wiki/HSL_and_HSV

				rgb = convert.hslToRgb(hsl[0],pixelCore.threshold/100,hsl[2]);
				px.r = rgb[0];
				px.g = rgb[1];
				px.b = rgb[2];
			}
		},
		saturationThreshold:function(px,i,l,pixels,w,h,pixelCore){
			var hsv = convert.rgbToHsv(px.r,px.g,px.b),rgb;
			
			if(hsv[1] > pixelCore.threshold/100) {
				//http://en.wikipedia.org/wiki/HSL_and_HSV

				rgb = convert.hsvToRgb(hsv[0],pixelCore.threshold/100,hsv[2]);
				px.r = rgb[0];
				px.g = rgb[1];
				px.b = rgb[2];
			}
		},
		dimThreshold:function(px,i,l,pixels,w,h,pixelCore){

			var luma = (0.2125*px.r + 0.7154*px.g + 0.0721*px.b)
			if(luma > pixelCore.threshold) {
				var yuv = convert.rgbToYuv(px.r,px.g,px.b),rgb;
				
				rgb = convert.yuvToRgb(pixelCore.threshold,yuv[1],yuv[2]);
				
				px.r = rgb[0];
				px.g = rgb[1];
				px.b = rgb[2];
			}
		},
		lightenThreshold:function(px,i,l,pixels,w,h,pixelCore){

			var luma = (0.2125*px.r + 0.7154*px.g + 0.0721*px.b)
			if(luma < pixelCore.threshold) {
				var yuv = convert.rgbToYuv(px.r,px.g,px.b),rgb;
				
				rgb = convert.yuvToRgb(pixelCore.threshold,yuv[1],yuv[2]);
				
				px.r = rgb[0];
				px.g = rgb[1];
				px.b = rgb[2];
			}
		},
		//these methods exist so you can verify what pixels are effected by modifying threshold
		//they may not continue to exist. do not depend on these to get your stuff done
		debug:{
			// same as above but instead of fixing it just tags target pixels as max green
			traceBrightenThreshold:function(px,i,l,pixels,w,h,pixelCore){
				var hsl = convert.rgbToHsl(px.r,px.g,px.b),rgb;

				if(hsl[1] > pixelCore.threshold/100) {
					px.r = 0;
					px.g = 255;
					px.b = 0;
				}
			},
			// same as above but instead of fixing it just tags target pixels as max green
			traceSaturationThreshold:function(px,i,l,pixels,w,h,pixelCore){
				var hsv = convert.rgbToHsv(px.r,px.g,px.b),rgb;
				
				if(hsv[1] > pixelCore.threshold/100) {
					//http://en.wikipedia.org/wiki/HSL_and_HSV

					px.r = 0;//rgb[0];
					px.g = 255;//rgb[1];
					px.b = 0;//rgb[2];
				}
			},
			// same as above but instead of fixing it just tags target pixels as max green
			traceDimThreshold:function(px,i,l,pixels,w,h,pixelCore){	
				var luma = (0.2125*px.r + 0.7154*px.g + 0.0721*px.b);
				if(luma < pixelCore.threshold) {
					px.r = 0;
					px.g = 255;
					px.b = 0;
				}
			},
			//this shows the characteristics of yuv lossyness
			yuvAndBack:function(px){
				var yuv = convert.rgbToYuv(px.r,px.g,px.b);
				var rgb = convert.yuvToRgb(yuv[0],yuv[1],yuv[2]);
				px.r = rgb[0];
				px.g = rgb[1];
				px.b = rgb[2];
			}
		}
	}
}

module.exports = PixelCore;