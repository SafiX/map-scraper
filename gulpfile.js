let gulp = require('gulp');
let webserver = require('gulp-webserver');

gulp.task('webserver', function() {
	gulp.src('site')
	    .pipe(webserver({
		    livereload: true,
		    open: true,
		    port: 4200
	    }));
});

gulp.task('default', [ 'webserver' ]);