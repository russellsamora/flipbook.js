# flipbook.js

Scroll-based inline flipbook animation for the internet. Checkout the [demo](https://russellgoldenberg.github.io/flipbook.js).


## Installation

``` npm install flipbook```

or 

``` <script src="flipbook.min.js"></script> ```



## Usage

``` html
	<div id='walk-cycle'></div>

	<script>
		flipbook({
			id: 'walk-cycle',
			path: 'frames/walk',
			extension: 'jpg',
			count: 86,
			speed: 0.5
		});
	</script>
```

## Options
* **id** (required)
	[String] The id of the element where the flipbook will be inserted

* **path** (required)
	[String] The relative path the directory where the images are

* **filename** (required)
	[String] The pattern of filename (*%3d* = 3 digits or 001, 002, etc, ex. 'images-%3d')

* **extension** (required)
	[String] The type of image file *(png or jpg)*

* **count** (required)
	[Number] Count of images in directory

* **speed** (optional)
	[0 to 1] How fast the scroll advances the frames (0: slow, 1: fast). Defaults to 0.5.

* **cover** (optional)
	[True or false] If the flipbook should go full window height, and center-crop (like CSS's `background-size: cover`). Defaults to false.

* **loaded** (optional)
	[Function] Callback function when the flipbook has loaded all images and is ready to play through. Defaults to none.


### Helpful bits
Convert a video to image sequence with ffmpeg:

```ffmpeg -i input.mp4 -r 12 frames/%d.png ```


## License & Credit

MIT © [Russell Goldenberg](http://russellgoldenberg.com)

Inspired by [canvid](https://github.com/gka/canvid/blob/master/canvid.js) and [stack](https://github.com/mbostock/stack)
