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
        var _id;
        var _container;
        var _graphic;
        var _sections;
        
        var _latestScrollPosition;
        var _ticking;
        var _windowHeight;
        var _sectionPositions;

        
        var init = function() {
            _id = params.id;
            
            _container = document.getElementById(_id);
            _container.classList.add('flip-container');
            
            _graphic = document.createElement('div');
            _graphic.classList.add('flip-graphic');
            
            _container.appendChild(_graphic);

            _sections = _container.querySelectorAll('section');

            setupEvents();
            onResize();
        };


        var onResize = function() {
        
            _graphic.style.height = innerHeight + 'px';
            _container.style.minHeight = innerHeight + 'px';

            var start = 0;
            var top = 0;
            
            // get the offset of each section trigger from the top of graphic container 
            _sectionPositions = [];
            for (var i = 0; i < _sections.length; i++) {
                top = _sections[i].getBoundingClientRect().top;
                if (!i) { start = top }
                _sectionPositions.push(top - start);
            }
        };

        var setupEvents = function() {
            window.addEventListener('resize', onResize, false);
        };
        



        init();

        return {};
    };

    return lib;

});