var gulp = require('gulp');
var tslint = require('gulp-tslint');
var shell = require('gulp-shell')
var bump = require('gulp-bump')
var git = require('gulp-git');
var tag_version = require('gulp-tag-version');

var serverFiles = {
    src: 'server/src/**/*.ts'
};

var clientFiles = {
    src: './src/**/*.ts'
}

function bumpVersion(ver) {
    return gulp.src(['./package.json'])
        .pipe(bump({ type: ver }))
        .pipe(gulp.dest('./'))
        .pipe(git.commit('Bump package version'))
        .pipe(tag_version());
}

gulp.task('compileClient', shell.task([
    'npm run vscode:prepublish'
]));

gulp.task('compileServer', shell.task([
    'cd server && npm install && npm run compile'
]));

gulp.task('tslint', function () {
    return gulp.src([serverFiles.src, clientFiles.src])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
});

gulp.task('build', gulp.series('compileClient', 'compileServer'))
gulp.task('buildAndLint', gulp.series('tslint', 'build'))
const buildAndLint = gulp.task('buildAndLint')

gulp.task('patch', gulp.series(buildAndLint, function () { return bumpVersion('patch'); }));
gulp.task('minor', gulp.series(buildAndLint, function () { return bumpVersion('minor'); }));
gulp.task('major', gulp.series(buildAndLint, function () { return bumpVersion('major'); }));

gulp.task('default', buildAndLint)
