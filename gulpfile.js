'use strict';

var browserify = require('browserify')
  , clean = require('gulp-clean')
  , connect = require('gulp-connect')
  , eslint = require('gulp-eslint')
  , glob = require('glob')
  , gulp = require('gulp')
  , karma = require('gulp-karma')
  , mocha = require('gulp-mocha')
  , ngmin = require('gulp-ngmin')
  , protractor = require('gulp-protractor').protractor
  , source = require('vinyl-source-stream')
  , streamify = require('gulp-streamify')
  , uglify = require('gulp-uglify');

var ngAnnotate = require('gulp-ng-annotate');

/*
 * Useful tasks:
 * - gulp fast:
 *   - linting
  *   - browserification
 *   - no minification, does not start server.
 * - gulp watch:
 *   - starts server with live reload enabled
 *   - lints, browserifies and live-reloads changes in browser
 *   - no minification
 * - gulp:
 *   - linting
 *   - browserification
 *   - minification and browserification of minified sources
 *
 * At development time, you should usually just have 'gulp watch' running in the
 * background all the time. Use 'gulp' before releases.
 */

var liveReload = true;

var getBundleName = function () {
  var version = require('./package.json').version;
  var name = require('./package.json').name;
  return version + '.' + name + '.' + 'min';
};

gulp.task('clean', function() {
  return gulp.src(['./ngmin', './dist'], { read: false })
  .pipe(clean());
});

gulp.task('lint', function() {
  return gulp.src(['scripts/**/*.js',
    '!scripts/bower_components/**/*.js',
    '!scripts/vendor/*.js'])
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('ngannotate', function () {
  return gulp.src(['scripts/**/*.js', '!scripts/bower_components/**' ])
    .pipe(ngAnnotate())
    .pipe(gulp.dest('ngannotate'));
    });

gulp.task('browserify', /*['lint', 'unit'],*/ function() {
  var bundler = browserify({
    entries: ['./scripts/app.js'],
    debug: true,
    shim: {
      "restangular": {
        "depends": ["angular", "lodash:_"],
        "exports": "null"
      }
    }
  });

  var bundle = function() {
    return bundler
      .bundle()
      .pipe(source('app.js'))
      .pipe(gulp.dest('./dist/'))
      .pipe(connect.reload());
  };

  return bundle();
});

gulp.task('ngmin', ['lint'], function() {
  return gulp.src([
    'scripts/**/*.js',
    '!scripts/bower_components/**',
  ])
  .pipe(ngmin())
  .pipe(gulp.dest('./ngmin'));
});

gulp.task('browserify-min', ['ngmin'], function() {
  return browserify('./ngmin/app.js')
  .bundle()
  .pipe(source('app.min.js'))
  .pipe(streamify(uglify({ mangle: false })))
  .pipe(gulp.dest('./dist/'));
});

gulp.task('browserify-min2', ['ngannotate'], function() {
  return browserify('./ngannotate/app.js')
  .bundle()
  .pipe(source('app.min.js'))
  .pipe(streamify(uglify({ mangle: false })))
  .pipe(gulp.dest('./dist/'));
});

gulp.task('server', ['browserify'], function() {
  connect.server({
    root: '',
    livereload: liveReload,
  });
});

gulp.task('watch', function() {
  gulp.start('server');
  gulp.watch([
    'scripts/**/*.js',
    '!scripts/bower_components/**',
  ], ['fast']);
});

gulp.task('fast', ['clean'], function() {
  gulp.start('browserify');
});

gulp.task('default', ['clean'], function() {
  liveReload = false;
  gulp.start('browserify', 'browserify-min');
});

  gulp.task('javascript', function() {

    var bundler = browserify({
      entries: ['./app/scripts/app.js'],
      debug: true
    });

    var bundle = function() {
      return bundler
      .bundle()
      .pipe(source(getBundleName() + '.js'))
      // .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      // Add transformation tasks to the pipeline here.
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/'));
    };

    return bundle();
  });
