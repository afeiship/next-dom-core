(function () {

  var gulp = require('gulp');
  var del = require('del');
  var concat = require('gulp-concat');
  var rename = require('gulp-rename');
  var uglify = require('gulp-uglify');
  var gulpFilter=require('gulp-filter');
  var filter = gulpFilter(['*'], {restore: true});
  var conf = {
    src: 'src',
    dist: 'dist'
  };

  var files={
    src:[
      conf.src + '/Base.js',
      conf.src + '/Core.js',
      conf.src + '/ZeptoFn.js'
    ],
    dist: 'next-dom-core.js',
    mini: 'next-dom-core.min.js'
  };

  gulp.task('clean', function () {
    del(conf.dist);
  });

  gulp.task('uglify', ['clean'], function () {
    return gulp.src(files.src)
      .pipe(concat(files.dist))
      .pipe(filter)
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename({
        extname: '.min.js'
      }))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('default', ['uglify']);

}());
