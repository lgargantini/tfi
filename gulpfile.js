var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');

gulp.task('lint', function () {
	gulp.src('./**/*.js')
	.pipe(jshint())
});
gulp.task('develop', function () {
	nodemon({script: 'server.js', ext: 'html js', ignore: ['ignored.js']})
	.on('change', ['lint'])
	.on('restart', function () {
		console.log('restarted!!!')
	})
})

gulp.task('mocha',function  () {
	return gulp.src(['test/*.js'], {read: false})
	.pipe(mocha({
		reporter: 'list'}))
	.on('error', gutil.log);
});
gulp.task('task-mocha', function () {
	gulp.watch(['lib/**', 'test/**'], ['mocha']);
});