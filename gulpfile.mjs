import gulp from "gulp";
import ejs from "gulp-ejs";
import htmlmin from "gulp-htmlmin";
import gif from "gulp-if";
import minifyInline from "gulp-minify-inline";
import rename from "gulp-rename";
import replace from "gulp-replace";
import size from "gulp-size";
import terser from "gulp-terser";
import { createRequire } from "module";
import yargs from "yargs";

const configFile = yargs(process.argv).argv.config || "./build.json";
const require = createRequire(import.meta.url);
const buildConfigs = require(configFile);

console.log(`using config file ${configFile}`);

ejs.__EJS__.delimiter = "*";
ejs.__EJS__.openDelimiter = "__ejs(/";
ejs.__EJS__.closeDelimiter = "/);";

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
  mangle: {
    toplevel: true,
  },
};

function compileTemplates(done) {
  const tasks = Object.entries(buildConfigs).map(([key, config]) => {
    const compileTemplatesWithConfig = () =>
      gulp
        .src(["src/*.js", "src/*.html"])
        .pipe(ejs({ ...config, __CONFIG_NAME: key }))
        .pipe(gif(!!key, rename({ suffix: `-${key}` })))
        .pipe(gulp.dest("dist"));
    return compileTemplatesWithConfig;
  });

  return gulp.series(...tasks, (seriesDone) => {
    seriesDone();
    done();
  })();
}

function minifyJs() {
  return gulp.src("dist/*.js").pipe(terser(terserOptions)).pipe(gulp.dest("dist"));
}

function minifyHtml() {
  return gulp
    .src("dist/*.html")
    .pipe(minifyInline({ js: terserOptions }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("dist"));
}

function optimize() {
  return gulp
    .src("dist/*")
    .pipe(replace(/parseInt\(["'](\d+)["']\)/, "$1"))
    .pipe(gulp.dest("dist"));
}

function printSize() {
  return gulp
    .src("dist/*")
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest("dist"));
}

export default gulp.series(compileTemplates, gulp.parallel(minifyJs, minifyHtml), optimize, printSize);
