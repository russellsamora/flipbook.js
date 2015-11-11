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
        var _context;
        var _offscreenCanvas;
        var _offscreenContext;

        // position
        var _canvasWidth;
        var _canvasHeight;
        var _containerH;
        var _graphicH;
        var _graphicLeft;
        var _start;
        var _end;

        // cover crop
        var _naturalWidth;
        var _naturalHeight;
        var _aspectRatio;
        var _crop = {};
            
        // misc
        var _ready;
        var _ticking;
        var _previousFrame = -1;
        
        var init = function() {
            
            var isInvalid = hasInvalidParams();

            if (isInvalid) {
                 error('invalid options, missing ' + isInvalid);
             } else {
                setupDefaultParams();
                setupDom();
                setupStyles();
                loadImages(function(err) {
                    if (err) {
                        error(error);
                    } else {
                        kickoff();
                    }
                });    
            }
        };


        var hasInvalidParams = function() {
            var isInvalid;
            var requiredParams;

            if (params.sprite) {
                requiredParams = ['id', 'path','extension', 'rows'];
            } else {
                requiredParams = ['id', 'path','extension', 'frames'];
            }

            requiredParams.forEach(function(p) {
                if(!params[p]) {
                    isInvalid = p;
                }
            });

            return isInvalid;
        };
        
        var setupDefaultParams = function() {
            params.speed = parseFloat(params.speed) || 0.5;

            if(params.sprite) {
                params.count = params.rows.reduce(function(a, b) { return a + b; });
            } else {
                params.count = parseInt(params.count);
            }
            params.path = params.path.trim();
            if (params.path.lastIndexOf('/') !== params.path.length - 1) {
                params.path += '/';
            }
        };

        var kickoff = function() {
            if(params.loaded && typeof params.loaded === 'function') {
                params.loaded();
            }
            _ready = true;
            setupEvents();
            onResize();
            drawFrame(0);
        };

        var setupDom = function() {
            // get container
            _container = document.getElementById(params.id);
            _container.classList.add('flipbook-container');
                
            // create graphic container / canvas for drawing
            _graphic = document.createElement('div');
            _graphic.classList.add('flipbook-graphic');
            _container.appendChild(_graphic);
            _canvas = createCanvas(_graphic);
            _context = _canvas.getContext('2d');
        };

        var setupStyles = function() {
            setStyles(_container, {
                'position': 'relative',
                'width': '100%',
                'overflow': 'hidden'
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

        var loadImages = function(cb) {
            // setup offscreen canvas
            _offscreenCanvas = document.createElement('canvas');
            _offscreenContext = _offscreenCanvas.getContext('2d');

            
            var numImages = params.sprite ? params.rows.length : numImages = params.count;

            // construct array of images
            var frames = createFrameData(numImages);

            var yOffset = 0;

            var loadNext = function(index) {
                var f = frames[index];
                loadImage(f, function(err, img) {
                    if (err) {
                        cb('error loading image');
                    } else {
                        f.img = img;

                        // get aspect ratio
                        if(index === 0) {
                            _naturalWidth = img.naturalWidth;
                            _naturalHeight = img.naturalHeight / f.rows;
                            _aspectRatio = Math.round(_naturalWidth / _naturalHeight  * 1000) / 1000;
                            _offscreenCanvas.width = _naturalWidth;
                            _offscreenCanvas.height = _naturalHeight * params.count;
                        }

                         // render each row image to offscreen canvas
                        for(var j = 0; j < f.rows; j++) {
                            _offscreenContext.drawImage(f.img, 0, j * _naturalHeight, _naturalWidth, _naturalHeight, 0, _naturalHeight * yOffset, _naturalWidth, _naturalHeight);
                            yOffset++;
                        }

                        // fire progress update
                        if(params.progress && typeof params.progress === 'function') {
                            params.progress({
                                frame: (index + 1), 
                                total: params.count,
                                percent: Math.round(index / (numImages - 1) * 100)
                            });
                        }

                        index++;
                        if(index < frames.length) {
                            loadNext(index);
                        } else {
                            cb();
                        }    
                    }
                });
            };

            loadNext(0);
        };

        var createFrameData = function(numImages) {
            var frames = [];
            for (var i = 0; i < numImages; i++) {
                frames[i] = {
                    src: params.path + (i + 1) + '.' + params.extension,
                    rows: params.sprite ? params.rows[i] : 1
                };
            }
            return frames;
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
                
            // cover or keep aspect
            if (params.cover) {
                _canvasHeight = innerHeight;
                var canvasRatio = _canvasWidth / _canvasHeight;

                // if canvas is taller than original, must crop to cover
                if (canvasRatio < _aspectRatio) {
                    // take full canvas height and canvas ratio amount of width
                    _crop.width = Math.floor(canvasRatio * _naturalHeight);
                    _crop.height = _naturalHeight;
                    _crop.offsetX = Math.floor((_naturalWidth - _crop.width) / 2);
                    _crop.offsetY = 0;
                } else {
                    _crop.height = Math.floor(_naturalWidth / canvasRatio);
                    _crop.width = _naturalWidth;
                    _crop.offsetX = 0;
                    _crop.offsetY = Math.floor((_naturalHeight - _crop.height) / 2);
                }

            } else {
                _canvasHeight = Math.floor(_canvasWidth / _aspectRatio);    
            }

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
            
            var index = Math.floor(percent * (params.count - 1));

            if(redraw || _previousFrame !== index) {
                _previousFrame = index;
                drawFrame(index);
            }
        };

        var drawFrame = function(index) {
            _context.clearRect(0, 0, _canvasWidth, _canvasHeight);

            var sx, sy, sw, sh;

            if (params.cover) {
                sx = _crop.offsetX;
                sy = _crop.offsetY + _naturalHeight * index;
                sw = _crop.width;
                sh = _crop.height;
            } else {
                sx = 0;
                sy = _naturalHeight * index;
                sw = _naturalWidth;
                sy = _naturalHeight;
            }
            
            _context.drawImage(_offscreenCanvas, sx, sy, sw, sh, 0, 0, _canvasWidth, _canvasHeight);
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
        };

        init();
    };

    return lib;

});