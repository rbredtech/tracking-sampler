import gulp from "gulp";
import ejs from "gulp-ejs";
import terser from "gulp-terser";
import htmlmin from "gulp-htmlmin";
import minifyInline from "gulp-minify-inline";
import size from "gulp-size";

const { SAMPLER_HOST, MAX_PERCENTILE } = process.env;

if (!SAMPLER_HOST) {
  throw Error("SAMPLER_HOST not configured");
}

if (!MAX_PERCENTILE) {
  throw Error("MAX_PERCENTILE is not configured");
}

const terserOptions = {
  compress: {
    arrows: false,
    booleans: false,
    comparisons: false,
    conditionals: false,
    drop_console: true,
    evaluate: false,
    if_return: false,
    keep_fargs: true,
    negate_iife: false,
    properties: false,
    typeofs: false,
  },
};

function copyTemplates() {
  return gulp.src("./src/*").pipe(gulp.dest("./dist"));
}

function compileTemplates() {
  return gulp
    .src("./dist/*")
    .pipe(ejs({ SAMPLER_HOST: "sampling.tvping.com", MAX_PERCENTILE: 10 }))
    .pipe(gulp.dest("./dist"));
}

function minifyJsTemplates() {
  return gulp.src("./dist/*.js").pipe(terser(terserOptions)).pipe(gulp.dest("./dist"));
}

function minifyHtmlTemplates() {
  return gulp
    .src("./dist/*.html")
    .pipe(minifyInline({ js: terserOptions }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("./dist"));
}

function printSize() {
  return gulp
    .src("./dist/*")
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest("dist"));
}

export default gulp.series(copyTemplates, compileTemplates, minifyJsTemplates, minifyHtmlTemplates, printSize);
