const gulp     = require('gulp');


/*------------------------------------------------------------------------------------------------*\
    CSS    
\*------------------------------------------------------------------------------------------------*/
var css_src  = './_styles/';
var css_dest = './css/';

const sass   = require('gulp-sass');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');

// Compile SCSS in expanded mode so it's easier to inspect the result.
gulp.task('sass', () =>
    gulp.src(css_src + '**/*.scss')
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(gulp.dest((file) => {
            return file.base;
        }))
);

// Then create a minified version in the output folder.
gulp.task('cssmin', () =>
	gulp.src(css_src + '**/*.css')
		.pipe(cssmin())
		.pipe(rename({extname: '.min.css'}))
		.pipe(gulp.dest(css_dest))
);

// This combined task makes it convenient to run all the steps together.
gulp.task('css', ['sass', 'cssmin'], () =>
    console.log('Processing (S)CSS. See gulpfile.js for details.')
)


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
gulp.task('svg2png', () =>
    gulp.src(img_src + '**/*.svg')
        .pipe(svg2png())
        .pipe(gulp.dest((file) => {
            return file.base;
        }))
);

// Next we're optimising all bitmap images, including the ones generated by the previous step, and
// putting them in the output folder.
gulp.task('imagemin', () =>
	gulp.src(img_src + '**/*.{png,jpg,gif}')
		.pipe(imagemin())
		.pipe(gulp.dest(img_dest))
);

// Finally, we're optimising the SVG's and putting them in the output folder.
gulp.task('svgmin', () =>
    gulp.src(img_src + '**/*.svg')
        .pipe(svgmin({
            plugins: [{
                removeDimensions: true
            }]
        }))
        .pipe(gulp.dest(img_dest))
);

// This combined task makes it convenient to run all the steps together.
gulp.task('img', ['svg2png', 'imagemin', 'svgmin'], () =>
    console.log('Processing images. See gulpfile.js for details.')
)


/*------------------------------------------------------------------------------------------------*\
    JS    
\*------------------------------------------------------------------------------------------------*/
var js_src      = './_scripts/';
var js_dest     = './js/';
var js_filename = 'script.js';

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const pump   = require('pump');


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
gulp.task('js', ['concat_js', 'uglify'], () =>
    console.log('Processing js. See gulpfile.js for details.')
)



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

