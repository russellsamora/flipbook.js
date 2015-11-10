/*
* flipbook.js is library 
*/

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        window.flipbook = factory.call(this);
    }
})(function() {

    var lib = function(params) {
        // dom
        var _container;
        var _graphic;
        var _canvas;
        var _ctx;
        var _loader;
        var _progress;

        // position
        var _canvasWidth;
        var _canvasHeight;
        var _containerH;
        var _graphicH;
        var _graphicLeft;
        var _start;
        var _end;
            
        // misc
        var _ready;
        var _frames;
        var _ticking;
        var _previousFrame = -1;
        
        var init = function() {
            var requiredParams = ['id', 'path','extension','frames'];
            var invalidParams;

            requiredParams.forEach(function(p) {
                if(!params[p]) {
                    invalidParams = p;
                }
            });

            // defaults
            params.speed = params.speed || 0.5;

            if (invalidParams) {
                 error('invalid options, missing ' + invalidParams);
             } else {
                setupDom();
                setupStyles();

                loadFrames(function(err) {
                    if (err) {
                        error(error);
                    } else {
                        kickoff();
                    }
                    
                });    
            }
        };



        /*** setup ***/
        var kickoff = function() {
            _ready = true;
            setupEvents();
            onResize();
            drawFrame(0);
            _container.removeChild(_loader);
        };

        var setupDom = function() {
            // get container
            _container = document.getElementById(params.id);
            _container.classList.add('flipbook-container');

            _loader = document.createElement('div');
            _loader.classList.add('flipbook-loader');
            _progress = document.createElement('div');
            _progress.classList.add('flipbook-loader--progress');
            
            var text = document.createElement('div');
            text.classList.add('flipbook-loader--text');
            text.innerText = 'Loading animation...';
            setStyles(text, {'position': 'relative'});

            _loader.appendChild(_progress);
            _loader.appendChild(text);

            _container.appendChild(_loader);
                
            // create graphic container / canvas for drawing
            _graphic = document.createElement('div');
            _graphic.classList.add('flipbook-graphic');
            _container.appendChild(_graphic);
            _canvas = createCanvas(_graphic);
            _ctx = _canvas.getContext('2d');
        };

        var setupStyles = function() {
            setStyles(_container, {
                'position': 'relative',
                'width': '100%',
                'overflow': 'hidden'
            });

            setStyles(_loader, {
                'position': 'relative',
                'text-align': 'center',
                'padding': '1em',
                'font-family': 'sans-serif',
                'color': '#666',
                'background': '#efefef'
            });

            setStyles(_progress, {
                'position': 'absolute',
                'z-index': 0,
                'top': 0,
                'left': 0,
                'width': 0,
                'height': '100%',
                'background': '#ddd'
            });

            setStyles(_graphic, {
                'position': 'absolute',
                'top': 0,
                'left': 0
            });

            setStyles(_canvas, {
                'position': 'absolute',
                'top': 0,
                'left': 0
            });
        };

        var setupEvents = function() {
            window.addEventListener('resize', onResize, false);
            window.addEventListener('scroll', onScroll, false);
        };

        var loadFrames = function(cb) {
            // construct array of images
            _frames = [];
            for (var i = 0; i < params.frames; i++) {
                _frames[i] = {
                    src: params.path + '/' + (i + 1) + '.' + params.extension
                };
            }

            var loadNext = function(index) {
                var f = _frames[index];
                loadImage(f, function(err, img) {
                    if (err) {
                        cb('error loading image');
                    } else {
                        f.img = img;

                        // get aspect ratio
                        if(index === 0) {
                            params.aspectRatio = Math.round(img.naturalWidth / img.naturalHeight * 1000) / 1000;
                        }

                        // progress update
                        setStyles(_progress, {
                            'width': Math.round(index / (params.frames - 1) * 100) + '%'
                        });

                        index++;
                        if(index < _frames.length) {
                            loadNext(index);
                        } else {
                            cb();
                        }    
                    }
                });
            };

            loadNext(0);
        };

        var createCanvas = function(el) {
            var canvas = document.createElement('canvas');
            canvas.classList.add('flipbook-canvas');

            el.appendChild(canvas);

            return canvas;
        };



        /*** update ***/
        var onResize = function() {
            
            /*** update graphic ***/
            _canvasWidth = _container.offsetWidth;
            _canvasHeight = Math.floor(_canvasWidth / params.aspectRatio);
            var canvasMargin = innerHeight - _canvasHeight; // total margin top + bottom of canvas
            _graphicH = _canvasHeight + canvasMargin;

            // canvas resize
            _canvas.width = _canvasWidth;
            _canvas.height = _canvasHeight;

            // canvas vertical align
            _canvas.style.top = Math.floor(canvasMargin / 2) + 'px';

            // graphic resize
            _graphic.style.height = _graphicH + 'px';
            _graphic.style.width = _canvasWidth + 'px';

            



            /*** update container ***/
            
            // container resize
            var factor = getFactor();
            _containerH = innerHeight * factor;
            _container.style.height =  _containerH + 'px';

    


            

            // grab updated dimensions
            var containerBB = _container.getBoundingClientRect();

            // get value from edge of screen to keep in same place when fixed
            _graphicLeft = containerBB.left;

            // scroll pos values where graphic should start and stop
            _start = containerBB.top + pageYOffset;
            _end = containerBB.bottom + pageYOffset - _graphic.offsetHeight;

            updateScroll();
            updateFrame(pageYOffset - _start, true); // force redraw
        };

        var onScroll = function() {
            requestTick();
        };

        var requestTick = function() {
            if (!_ticking) {
                requestAnimationFrame(updateScroll);
            }
            _ticking = true;
        };

        var updateScroll = function() {
            _ticking = false;
            if (_ready) {
                var top = pageYOffset - _start;
                var bottom = pageYOffset - _end;

                // TODO optimize
                if (top > 0 && bottom < 0) {
                    // we're in
                    setStyles(_graphic, {
                        'position': 'fixed',
                        'top': 0,
                        'left': _graphicLeft + 'px',
                        'bottom': 'auto'
                    });

                    updateFrame(top);

                } else if (bottom > 0) {
                    // below
                    setStyles(_graphic, {
                        'position': 'absolute',
                        'top': 'auto',
                        'left': 0,
                        'bottom': 0
                    });

                    updateFrame(_containerH);

                } else if(top < 0) {
                    // above
                    setStyles(_graphic, {
                        'position': 'absolute',
                        'top': 0,
                        'left': 0,
                        'bottom': 'auto'
                    });

                    updateFrame(0);
                    
                } else {
                    // panic
                }
            }
        };

        var updateFrame = function(top, redraw) {
            var percent = top / (_containerH - _graphicH);
            
            // constrain to a real percent
            percent = Math.min(Math.max(percent, 0), 1);
            
            var index = Math.floor(percent * (params.frames - 1));

            if(redraw || _previousFrame !== index) {
                _previousFrame = index;
                drawFrame(index);
            }
        };

        var drawFrame = function(index) {
            _ctx.clearRect(0, 0, _canvasWidth, _canvasHeight);
            _ctx.drawImage(_frames[index].img, 0, 0, _canvasWidth, _canvasHeight);
        };

        

        /*** helpers ***/
        var setStyles = function(el, attrs) {
            for(var prop in attrs) {
                el.style[prop] = attrs[prop];
            }
        };

        var getFactor = function() {
            var multiplier = 10;
            var min = 2;
            return min + multiplier * (1 - params.speed);
        };

        var loadImage = function(f, cb) {
            var img = new Image();
            img.onload = function() { 
                cb(null, img);
            };
            img.onerror = function() { 
                cb('error loading image: ' + f.src);
            };
            img.src = f.src;
        };

        var raf = function() {
            return window.requestAnimationFrame
                || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame
                || window.msRequestAnimationFrame
                || function(callback) { return setTimeout(callback, 1000 / 60); };
        };

        var error = function(msg) {
            if(console && console.error) {
                console.error('::flipbook:: ' + msg);
            }
        }



        init();
    };

    return lib;

});