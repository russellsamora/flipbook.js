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
		// instantiate the flipbook
		flipbook({
			id: 'walk-cycle',
			path: 'frames/walk',
			extension: 'jpg',
			frames: 86,
			aspectRatio: 1.52,
			speed: 0.5
		});
	</script>
```

### Convert video

```ffmpeg -i input.mp4 -r 12 frames/%d.png ```


## License & Credit

MIT © [Russell Goldenberg](http://russellgoldenberg.com)

Inspired by [canvid](https://github.com/gka/canvid/blob/master/canvid.js) and [stack](https://github.com/mbostock/stack)
