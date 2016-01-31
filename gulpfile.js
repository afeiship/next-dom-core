(function () {

  var gulp = require('gulp');
  var del = require('del');
  var concat = require('gulp-concat');
  var rename = require('gulp-rename');
  var uglify = require('gulp-uglify');
  var conf = {
    src: 'src',
    dist: 'dist'
  };

  gulp.task('clean', function () {
    del(conf.dist);
  });

  gulp.task('uglify', ['clean'], function () {
    gulp.src([
        conf.src + '/zepto-util.js',
        conf.src + '/zepto-ready.js',
        conf.src + '/zepto-matches.js',
        conf.src + '/zepto-fragment.js',
        conf.src + '/zepto-qsa.js',
        conf.src + '/zepto-oop.js',
        conf.src + '/zepto-static.js',
        conf.src + '/zepto-proto.js'
      ])
      .pipe(concat('next-dom-core.js'))
      .pipe(uglify())
      //.pipe(rename({
      //  extname: '.min.js'
      //}))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('default', ['uglify']);

}());
