/// /////////////////////////////
// Setup//
/// /////////////////////////////

// Plugins
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const del = require('del')
const gulp = require('gulp')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')
const rename = require('gulp-rename')
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const cssnano = require('gulp-cssnano')
const concatCss = require('gulp-concat-css')
const spawn = require('child_process').spawn
const browserSync = require('browser-sync')

/// /////////////////////////////
// Tasks//
/// /////////////////////////////
const server = browserSync.create()

const staticDest = 'static/'

const paths = {
  scripts: {
    src: 'src/js/*.js',
    dest: staticDest + 'js/'
  },
  styles: {
    src: 'src/sass/project.scss',
    dest: staticDest + 'css/'
  },
  images: {
    src: 'src/img/**/*',
    dest: staticDest + 'img/'
  },
  vendor: {
    src: 'node_modules/',
    dest: staticDest + 'vendor/'
  },
  templates: 'templates/**/*.html'
}

// // Browser sync server for live reload
// gulp.task('browserSync', function () {
//   browserSync.init(
//     [paths.css + '/*.css', paths.js + '/*.js', paths.templates + '/**/*.html'], {
//       proxy: 'localhost:8000'
//     })
// })

const clean = () => del(['static'])

// Image compression
function imgCompression () {
  return gulp.src(paths.images.src)
    .pipe(imagemin()) // Compresses PNG, JPEG, GIF and SVG images
    .pipe(gulp.dest(paths.images.dest))
}

function scripts () {
  return gulp.src(paths.scripts.src, { sourcemaps: true })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('index.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
}

function vendorFontAwesome () {
  return gulp.src([paths.vendor.src + '@fortawesome/fontawesome-pro/js/all.min.js'])
    .pipe(gulp.dest(paths.vendor.dest + 'fontawesome-pro/'))
}

function vendorBootstrapCss () {
  return gulp.src([paths.vendor.src + 'bootstrap/dist/css/bootstrap.min.css'])
    .pipe(gulp.dest(paths.vendor.dest + 'bootstrap/css/'))
}

function vendorBootstrapJs () {
  return gulp.src([paths.vendor.src + 'bootstrap/dist/js/bootstrap.bundle.min.js'])
    .pipe(gulp.dest(paths.vendor.dest + 'bootstrap/js/'))
}

function styles () {
  return gulp.src(paths.styles.src, { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] })) // Adds vendor prefixes
    .pipe(concatCss('bundle.css'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano()) // Minifies the result
    .pipe(gulp.dest(paths.styles.dest))
}

// Run django server
function runServer (cb) {
  var cmd = spawn('python', ['manage.py', 'runserver'], { stdio: 'inherit' })
  cmd.on('close', function (code) {
    console.log('runServer exited with code ' + code)
    cb(code)
  })
}

function reload (done) {
  server.reload()
  done()
}

function serve (done) {
  server.init({
    proxy: 'localhost:8000'
  })
  done()
}

function watch () {
  gulp.watch(paths.styles.src, gulp.series(styles, reload))
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload))
  //   gulp.watch(paths.images + '/*', ['imgCompression'])
  gulp.watch(paths.templates, reload)
}

// const dev = gulp.series(clean, scripts, runServer, serve, watch)
exports.runServer = gulp.series(runServer)
exports.static = gulp.parallel(scripts, styles, vendorFontAwesome, vendorBootstrapCss, vendorBootstrapJs, imgCompression)
exports.dev = gulp.series(clean, gulp.parallel(scripts, styles, vendorFontAwesome, vendorBootstrapCss, vendorBootstrapJs, imgCompression), serve, watch)
