import gulp from "gulp";
import replace from "gulp-replace";
import terser from "gulp-terser";
import htmlmin from "gulp-htmlmin";
import minifyInline from "gulp-minify-inline";
import size from "gulp-size";

const { SAMPLER_BASE_URL } = process.env;

if (!SAMPLER_BASE_URL) {
  throw Error("SAMPLER_BASE_URL not configured");
}

const terserOptions = {
  ecma: 5,
  ie8: true,
  compress: {
    arrows: false,
    booleans: false,
    comparisons: false,
    conditionals: false,
    evaluate: false,
    if_return: false,
    keep_fargs: true,
    negate_iife: false,
    properties: false,
    typeofs: false,
  },
};

function minifyJsTemplates() {
  return gulp.src("./src/*.js").pipe(terser(terserOptions)).pipe(gulp.dest("./dist"));
}

function minifyHtmlTemplates() {
  return gulp
    .src("./src/*.html")
    .pipe(minifyInline({ js: terserOptions }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("./dist"));
}

function setBaseUrl() {
  return gulp.src("./dist/**").pipe(replace("http://localhost:4000", SAMPLER_BASE_URL)).pipe(gulp.dest("./dist"));
}

function printSize() {
  return gulp
    .src("./dist/**")
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest("dist"));
}

export default gulp.series(minifyJsTemplates, minifyHtmlTemplates, setBaseUrl, printSize);