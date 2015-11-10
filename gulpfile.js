var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function() {
	return gulp.src('flipbook.js')
		.pipe(uglify())
		.pipe(rename('flipbook.min.js'))
		.pipe(gulp.dest(''));
});