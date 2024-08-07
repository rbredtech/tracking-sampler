import gulp from "gulp";
import ejs from "gulp-ejs";
import htmlmin from "gulp-htmlmin";
import gif from "gulp-if";
import minifyInline from "gulp-minify-inline";
import rename from "gulp-rename";
import size from "gulp-size";
import terser from "gulp-terser";

const buildConfigs = [
  {
    SAMPLER_HOST: "sampling.tvping.com",
    MAX_PERCENTILE: 10,
  },
  {
    SAMPLER_HOST: "sampling.tvping.com",
    MAX_PERCENTILE: 10,
    FILE_SUFFIX: "agf",
  },
];

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

function compileTemplates(done) {
  const tasks = buildConfigs.map(function ({ SAMPLER_HOST, MAX_PERCENTILE, FILE_SUFFIX }) {
    const compileTemplateWithConfig = function (taskDone) {
      gulp
        .src(["src/*", "!src/testing*"])
        .pipe(ejs({ SAMPLER_HOST, MAX_PERCENTILE, FILE_SUFFIX }))
        .pipe(gif(!!FILE_SUFFIX, rename({ suffix: `-${FILE_SUFFIX}` })))
        .pipe(gulp.dest("./dist"));
      taskDone();
    };
    return compileTemplateWithConfig;
  });

  return gulp.parallel(...tasks, (parallelDone) => {
    parallelDone();
    done();
  })();
}

function compileTestingTemplates() {
  return gulp
    .src("./src/testing*")
    .pipe(ejs({ SAMPLER_HOST: "sampling.tvping.com" }))
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

export default gulp.series(compileTemplates, compileTestingTemplates, minifyJsTemplates, minifyHtmlTemplates, printSize);
