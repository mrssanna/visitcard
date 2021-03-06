var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber"); //compilation error
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var run = require("run-sequence");
var del = require("del");
var server = require("browser-sync").create();

var deploy = require('gulp-gh-pages-with-updated-gift');

gulp.task("style", function (done) {
    gulp.src("less/style.less")
        .pipe(plumber())
        .pipe(less())
        .pipe(postcss([
            autoprefixer({browsers: [
                "last 2 versions"
            ]}),
            mqpacker({
                sort: true
            })
        ]))
        .pipe(gulp.dest("build/css"))
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("build/css"));
        //.pipe(server.stream());
        server.reload();
        done();

    gulp.src("less/base.less")
        .pipe(less())
        .pipe(gulp.dest("build/css"));
});

gulp.task("images", function () {
    return gulp.src("build/img/**/*.{png,jpg,gif}") //return dont't work - if plumber used
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.jpegtran({progressive: true})
        ]))
        .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function () {
    return gulp.src("build/img/icons/*.svg")
        .pipe(svgmin())
        .pipe(svgstore({
            inlineSvg: true //inlineSvg - svg will be used in html inline,
        }))

        .pipe(rename("symbols.svg"))
        .pipe(gulp.dest("build/img"));
});

gulp.task("copy", function () {
    return gulp.src([
        "fonts/**/*.{woff,woff2}",
        "img/**",
        "js/**",
        "*.html"
        ], {
        base: "."
        })
        .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
    return del("build");
});

gulp.task("html:copy", function () {
    return gulp.src("*.html")
        .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function (done) {
    server.reload();
    done();
});

gulp.task("serve", function () {
    server.init({
        server: "build/"
    });

    gulp.watch("less/**/*.less", ["style"]);
    gulp.watch("*.html", ["html:update"]);

});
//execute
//npm start

gulp.task("build", function (fn) {
    run(
        "clean",
        "copy",
        "style",
        "images",
        "symbols",
        fn
    );
});

/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
    return gulp.src("./build/**/*")
        .pipe(deploy())
});
