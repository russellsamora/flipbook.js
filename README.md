# flipbook.js

Scroll-based inline flipbook animation for the internet. Checkout the [demo](https://russellgoldenberg.github.io/flipbook.js/demo).

## Usage

``` html
	<div id='walk-cycle'></div>

	// include the flipbook library
	<script src='flipbook.js'></script>

	<script>
		// instantiate the flipbook
		flipbook({
			id: 'flip-walk',
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


Inspired by [canvid](https://github.com/gka/canvid/blob/master/canvid.js) and [stack](https://github.com/mbostock/stack)