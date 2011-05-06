node-canvasutil
===============

this is a module designed to provide a lib of color space conversion functions and
to provide filters for transforming pixels in a canvas image data array in wierd, fun, and useful ways.

api
-------

PixelCore
pixel core is the core object used to apply transforms on a canvas.

this is a standard object so extend it as you need =)
	var PixelCore = require('canvasutil').PixelCore
	, pixelProcessor = new PixelCore();

this is the only method defined in the prototype of PixelCore
it accepts a node canvas as arg 1 and a transform callback as arg 2
	pixelProcessor.iterate(Canvas,eachPixelCallback);

this is a value that may be used in transform callbacks that have a scaling behavior
	pixelProcessor.threshold = 50;

the transforms object is a convience property to hold all available transform methods
	pixelProcessor.transforms

this holds all grayscale flavors of transforms
	pixelProcessor.transforms.grayscale
	//the best grayscale transform is luma so use that one unless you have a specific need
	pixelProcessor.transforms.grayscale.luma

and i have some other interesting transforms
	//brightens everything below a threshold to threshold
	//threshold range is 0-100
	pixelProcessor.transforms.brightenThreshold

	//whitens any pixel with a saturation greater than threshold
	//threshold range is 0-100
	pixelProcessor.transforms.saturationThreshold

	//dims any pixel with a Luma greater than threshold. this is not the same as adding black
	//threshold range is 0-255
	pixelProcessor.transforms.dimThreshold

	//lighten any pixel with a Luma less than threshold. this is not the same as adding white
	//threshold range is 0-255
	pixelProcessor.transforms.lightenThreshold


conversionLib
conversion lib has all of the color space conversion functions.

all of these function exports take 3 arguments that are the 3 components of their colorspace
all of these function return and array with the 3 components of the new color space

	rgbToHsl(r,g,b)
	hslToRgb(h.s.l)
	rgbToHsv(r,g,b)
	hsvToRgb(h,s,v)
	rgbToYuv(r,g,b)
	yuvToRgb(y,u,v)

this accepts r,g,b like the others bvut only returns the Y component of YUV

	luma709Only(r,g,b)

i welcome pull requests for other helper methods for color conversion, opacity to color, hex to rgb etc.
i feel that this is where they belong... for now =)

example
-------

	var Canvas = require('canvas')
	, canvas = new Canvas(100,100)
	,pxCore = new require('canvasutil').PixelCore;
	,img = new Canvas.Image();

	img.onload(function(){
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img,0,0);

		pxCore.threshold = 30;
		pxCore.itterate(canvas,pxCore.transforms.brightenThreshold);

		canvas.toDataURL(function(err,url){
			console.log(url);
		});
	});
	img.src = "some path to an image";
