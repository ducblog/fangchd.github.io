const gulp = require('gulp');
const concat = require('gulp-concat');
//const minify = require('gulp-minify');
const cleanCss = require('gulp-clean-css');

const jsFiles = [
    'assets/vendor/jquery/dist/jquery.min.js',
    'assets/js/jquery.toc.js',
    'assets/js/lunr.min.js',
    'assets/js/search.js',
    'assets/vendor/share.js/dist/js/share.min.js',
    'assets/js/geopattern.js',
    'assets/js/prism.js',
];

gulp.task('pack-js', function () {
    return gulp.src(jsFiles)
		.pipe(concat('bundle.js'))
		//.pipe(minify({ ext: { min: '.js' }, noSource: true }))
		.pipe(gulp.dest('assets/static'));
});

gulp.task('pack-css', function () {
    return gulp.src('assets/css/index.css')
		.pipe(cleanCss({compatibility: 'ie8', keepSpecialComments: 0}))
		.pipe(concat('bundle.css'))
        .pipe(gulp.dest('assets/static'));
});

gulp.task('default', ['pack-js', 'pack-css']);