import gulp from "gulp";
import ejs from "gulp-ejs";
import htmlmin from "gulp-htmlmin";
import gif from "gulp-if";
import minifyInline from "gulp-minify-inline";
import rename from "gulp-rename";
import size from "gulp-size";
import terser from "gulp-terser";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const buildConfigs = require("./build.json");

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
        .src(["./src/*", "!./src/partials/**/*"])
        .pipe(ejs({ ...config, __CONFIG_NAME: key }))
        .pipe(gif(!!key, rename({ suffix: `-${key}` })))
        .pipe(gulp.dest("./dist"));
    return compileTemplatesWithConfig;
  });

  return gulp.series(...tasks, (seriesDone) => {
    seriesDone();
    done();
  })();
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

export default gulp.series(compileTemplates, minifyJsTemplates, minifyHtmlTemplates, printSize);
