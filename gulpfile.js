const gulp        = require('gulp');
const runSequence = require('run-sequence');
const pump        = require('pump');
const fs          = require('fs');
const del         = require('del');

/*------------------------------------------------------------------------------------------------*\
    CSS
\*------------------------------------------------------------------------------------------------*/
var css_src  = './_styles/';
var css_dest = './css/';

const sass   = require('gulp-sass');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');

const now = Date.now()
//console.log(now);

gulp.task('empty_css_output', () =>
    del.sync([css_dest + '*.*'])
);

// Compile SCSS in expanded mode so it's easier to inspect the result.
gulp.task('sass', (cb) =>
    pump([
        gulp.src(css_src + '**/*.scss'),
        sass({outputStyle: 'expanded'}),
        gulp.dest((file) => {
            return file.base;
        })
    ],
    cb)
);

// Then create a minified version in the output folder.
gulp.task('cssmin', (cb) =>
    pump([
        gulp.src(css_src + '**/*.css'),
        cssmin(),
        rename({extname: '.min.css'}),
        gulp.dest((file) => {

            // Establish the data storage name:
            //name       = file.path.replace(file.base, '').replace('.min.css', '');
            //fs.writeFile('./_data/cache_bust_css--' + name + '.yml', 'date: ' + now);
            // Establish the unix timestamp of the file's mtime:
            // Hmmm, this isn't easily available to the rename function.
            // My JS/Node-fu isn't good enough at the moment, so stick with const now, but
            // KEEP FOR REFERENCE
            //mtime      = file.stat.mtime;
            //mtimedate  = new Date(mtime);
            //mtimestamp = Math.floor(mtimedate);

            fs.writeFile('./_data/cache_bust_css.yml', 'date: ' + now);
            return css_dest;
        }),
        rename({suffix: '.' + now}),
        gulp.dest(css_dest)
    ],
    cb)
);

// This combined task makes it convenient to run all the steps together.
gulp.task('css', () => {
    console.log('Processing (S)CSS. See gulpfile.js for details.');
    runSequence('empty_css_output', 'sass', 'cssmin');
})


/*------------------------------------------------------------------------------------------------*\
    IMAGES
\*------------------------------------------------------------------------------------------------*/
var img_src  = './_images/';
var img_dest = './img/';

const svg2png  = require('gulp-svg2png');
const imagemin = require('gulp-imagemin');
const svgmin   = require('gulp-svgmin');

// Here we're converting SVG to PNG as a fallback for older browsers.
// Note we're placing the files in the same directry as the SVG files, not the output folder as
// we're not done processing them yet.
// Also note that we're doing this BEFORE we optimise the SVG. The SVG optimisation (below) removes
// the width and height attributes which causes problems for the PNG generation.
gulp.task('svg2png', (cb) =>
    pump([
        gulp.src(img_src + '**/*.svg'),
        svg2png(),
        gulp.dest((file) => {
            return file.base;
        })
    ],
    cb)
);

// Next we're optimising all bitmap images, including the ones generated by the previous step, and
// putting them in the output folder.
gulp.task('imagemin', (cb) =>
    pump([
        gulp.src(img_src + '**/*.{png,jpg,gif}'),
        imagemin(),
        gulp.dest(img_dest)
    ],
    cb)
);

// Finally, we're optimising the SVG's and putting them in the output folder.
gulp.task('svgmin', (cb) =>
    pump([
        gulp.src(img_src + '**/*.svg'),
        svgmin({
            plugins: [{
                removeDimensions: true
            }]
        }),
        gulp.dest(img_dest)
    ],
    cb)
);

// This combined task makes it convenient to run all the steps together.
gulp.task('img', () => {
    console.log('Processing images. See gulpfile.js for details.');
    runSequence('svg2png', 'imagemin', 'svgmin');
})


/*------------------------------------------------------------------------------------------------*\
    JS
\*------------------------------------------------------------------------------------------------*/
var js_src      = './_scripts/';
var js_dest     = './js/';
var js_filename = 'script.js';

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');



gulp.task('concat_js', () =>
    gulp.src([
        './_scripts/cookie-notice-settings.js',
        './_scripts/layout-adjustments.js',
        //'./bower_components/Fall-Back-Nav-Bar/nav-bar.js',
        //'./bower_components/Fall-Back-Over-Panel/over-panel.js',
        './bower_components/Fall-Back-Cookie-Notice/cookie-notice.js',
        './bower_components/Fall-Back-SVG/svg.js'
    ])
    .pipe(concat(js_filename))
    .pipe(gulp.dest(js_src))
);


gulp.task('uglify', (cb) =>
    pump([
        gulp.src(js_src + js_filename),
        uglify(),
        rename({extname: '.min.js'}),
        gulp.dest(js_dest)
    ],
    cb)
);



// This combined task makes it convenient to run all the steps together.
gulp.task('js', () => {
    console.log('Processing js. See gulpfile.js for details.');
    runSequence('concat_js', 'uglify');
})



/*------------------------------------------------------------------------------------------------*\
    WATCHERS
\*------------------------------------------------------------------------------------------------*/

// Watch CSS:
gulp.task('watch_css', function(){
    gulp.watch(css_src + '**/*.scss', ['css']);
});

// Watch JS:
gulp.task('watch_js', function(){
    gulp.watch(js_src + '**/*.js', ['js']);
});


// Watch all of the above:
gulp.task('watch_all', function(){
    gulp.watch(css_src + '**/*.scss', ['css']);
    gulp.watch(js_src + '**/*.js', ['js']);
});

