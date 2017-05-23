const gulp = require('gulp');
const rename = require('gulp-rename');
const babel = require('gulp-babel');

gulp.task('lib', () => {
  return gulp.src(['src/**/*.js', '!src/show_module_dependents.js', '!src/find_module_uses.js'])
    .pipe(babel({
      "plugins": ['transform-flow-strip-types']
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('bin', () => {
  return gulp.src(['src/show_module_dependents.js', 'src/find_module_uses.js'])
    .pipe(rename((path) => {
      path.basename = path.basename.split('_').join('-');
      path.extname = '';
    }))
    .pipe(babel({
      "plugins": ['transform-flow-strip-types']
    }))
    .pipe(gulp.dest('bin'));
});

gulp.task('default', ['lib', 'bin']);
