var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();


gulp.task('default', function() {

	// serve
	browserSync.init({
		server: {
		    baseDir: './'
		},
		notify: false
	});

	// watch
	gulp.watch(['flipbook.js', 'index.html'], browserSync.reload);
});

gulp.task('min', function() {
	return gulp.src('flipbook.js')
		.pipe(uglify())
		.pipe(rename('flipbook.min.js'))
		.pipe(gulp.dest(''));
});