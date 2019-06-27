// Importing specific gulp API functions
const { src, dest, watch, series, parallel } = require('gulp');

// Importing gulp plugins
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const browsersync = require('browser-sync');
const fs = require('fs');
const del = require('del');
var replace = require('gulp-replace');

// Todo: Add sassDoc and jsDoc

// File paths
const files = { 
    scssPath: 'src/scss/**/*.scss',
    cssPath: 'src/css/**/*.css',
    jsPath: 'src/js/**/*.js',
    imgPath: 'src/images/**/*.{png, jpg, jpeg, gif}',
    fontsPath: 'src/fonts/**/*',
    srcPath: './src',
    distPath: './dist',
}

// Compiles the style.scss file into style.css
function scssTask(){    
      return src(files.scssPath, { sourcemaps: true })
        .pipe(sass().on('error', sass.logError)) // compile SCSS to CSS
        .pipe(dest(files.distPath + '/css', { sourcemaps: 'maps' }));
}

// Minify CSS
function cssMinifyTask(){
  return src([files.distPath + '/css/*.css', '!' + files.distPath + '/css/*.min.css'], { sourcemaps: true })
        .pipe(postcss([ autoprefixer(), cssnano()]))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(files.distPath + '/css', { sourcemaps: 'maps' }));

        // Use sass({ outputStyle: 'compressed' })
}

// Concatenates and uglifies JS files to script.js
function jsTask(){
    return src([
        files.jsPath
        //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
        ], { sourcemaps: true })
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(dest(files.distPath + '/js', { sourcemaps: 'maps' })
    );
}

// Cachebust
var cbString = new Date().getTime();
function cacheBustTask(){
    return src([files.srcPath + '/index.html'])
        .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
        .pipe(dest(files.distPath));
}

// Watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask(){
    watch([files.scssPath, files.jsPath], 
        parallel(scssTask, jsTask));    
}

function clearTask(){
  return del(files.distPath + '/**', {force:true})
}
// Copy assets directory
function copyAssets() {
    // Copy assets
    return src([files.imgPath, files.fontsPath])
    .pipe(dest(files.distPath));
}

// BrowserSy
function browserSyncTask() {
    browsersync({
        server: {
            baseDir: files.distPath
        },
        notify: false,
        open: false,
        //browser: "google chrome",
        // proxy: "0.0.0.0:5000"
    });
}

// BrowserSync reload 
function browserReload () {
    return browsersync.reload;
}

// Watch files
function watchFiles() {
    // Watch SCSS changes    
    watch(files.scssPath, parallel(scssTask))
    .on('change', browserReload());
    // Watch javascripts changes    
    watch(files.jsPath, parallel(jsTask))
    .on('change', browserReload());
    // Assets Watch and copy to build in some file changes
    watch([files.imgPath, files.fontsPath, files.srcPath + '/*.html'])
    .on('change', series(copyAssets, scssTask, jsTask, cacheBustTask, browserReload()));
}

const watching = parallel(watchFiles, browserSyncTask);
const build = series(clearTask, parallel(cacheBustTask, copyAssets, scssTask, jsTask));

exports.js = jsTask;
exports.sass = scssTask;
exports.css = cssMinifyTask;
exports.clear = clearTask;
//exports.build = series(clearTask, parallel(copyAssets, scssTask, jsTask));
exports.default = series(build, watching);
exports.prod = series(build, cssMinifyTask);
exports.watch = watching;

