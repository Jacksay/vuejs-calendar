/**
 * Created by jacksay on 21/05/15.
 * Task runner
 */

var gulp = require('gulp'),
    debug = require('gulp-debug'),
    babel = require('gulp-babel'),
    umd = require('gulp-umd'),
    plumber = require('gulp-plumber'),
    mocha = require('gulp-mocha'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util')
;

// Basic example
gulp.task('default', ['watch:js']);

gulp.task('mocha', ['js'], function() {
    return gulp.src(['test/*.js'], { read: false })
        .pipe(plumber())
        .pipe(mocha({ reporter: 'list' }))
        .on('error', gutil.log);
});

gulp.task('styles', function(){
  gulp.src(['src/**/*.scss'])
    .pipe(sass())
    .pipe(gulp.dest('build'));
})

gulp.task('examples-copy', function(){
  gulp.src(['src/**/*.html'])
    .pipe(gulp.dest('build'));
})

gulp.task('examples-copy', function(){
  gulp.src(['src/**/*.html'])
    .pipe(gulp.dest('build'));
})

gulp.task('js', function(){
    gulp.src(['src/**/*.js'])
        .pipe(plumber())
        .pipe(babel())
        .pipe(umd())
        .pipe(gulp.dest('build'))
})

gulp.task('watch:js', ['js', 'styles', 'examples-copy', 'mocha'], function () {
    gulp.watch(['src/**/*.js', 'test/*.js'], ['mocha', 'examples-copy', 'styles']);
    gulp.watch(['src/**/*.scss'], ['styles']);
    gulp.watch(['src/**/*.html'], ['examples-copy']);
});
