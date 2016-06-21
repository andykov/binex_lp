'use strict';

var gulp = require('gulp'),
	watch = require("gulp-watch"),
	prefixer = require('gulp-autoprefixer'),
	// stylus = require('gulp-stylus'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	minifyCSS = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	rigger = require('gulp-rigger'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	spritesmith = require('gulp.spritesmith'),
	rimraf = require('rimraf'),
	rename = require('gulp-rename'),
	plumber = require('gulp-plumber'),
	jshint = require('gulp-jshint'),
	browserSync = require("browser-sync").create(),
	reload = browserSync.reload;

var path = {
	//Говорим куда складывать готовые после сборки файлы
	build: { 
		html: 'build/',
		js: 'build/js/',
		css: 'build/css/',
		img: 'build/img/',
		spriteImgPath: 'build/sprite/', // сюда кидаем готовый спрайт
		spriteImgName: '../img/sprite/sprite-cov.png', // путь до файла, нужен для шаблона
		// spriteImg: 'build/img/sprite/', // сюда кидаем готовый спрайт
		fonts: 'build/css/fonts/',
		video: 'build/video/',
	},
	//Пути откуда брать исходники
	src: { 
		html: 'src/*.html',
		scripts: 'src/scripts/**/*.js',
		style: 'src/style/**/*.+(scss|css)',
		images: ['src/images/**/*', '!src/images/sprite/*.*'], // Игнорируем папку для спрайта
		spriteOrigin: 'src/images/sprite/**/*.+(jpg|jpeg|gif|png|svg)', // отсюда берем исходники для спрайта
		spriteSass: 'src/style/utils/', // сюда кидаем сгенерированный файл с переменными для спрайта
		fonts: 'src/style/fonts/**/*.*',
		video: 'src/video/**/*.+(mp4|webm|ogg|ogv)',
	},
	//Следим за файлами
	watch: {
		html: 'src/**/*.html',
		scripts: 'src/scripts/**/*.js',
		style: 'src/style/**/*.scss',
		images: 'src/images/**/*',
		sprite: 'src/images/sprite/*.*',
		fonts: 'src/style/fonts/**/*.*',
		video: 'src/video/**/*.+(mp4|webm|ogg|ogv)',
	},
	clean: './build/img/*'
};


// Поднимаем вебсервер
gulp.task('webserver', function () {
	// [path.watch.style, path.watch.scripts], 
	browserSync.init({
        server: {
			baseDir: "./build"
		},
		host: 'localhost',
		port: 9000,
		logPrefix: "gulp_frontend",
		// tunnel: true,
		ui: {
		    port: 9001
		}
    });
    browserSync.notify("Compiling, please wait!");
    // with config + callback
	// browserSync.init(config, function (err, browserSync) {
	//     if (!err) {
	//         console.log("BrowserSync is ready!");
	//     }
	// });
});

// Сборка HTML
gulp.task('html:build', function () {
	gulp.src(path.src.html)
		.pipe(plumber())
		.pipe(rigger()) // Инклюдит файлы, пример (//= template/footer.html)
		.pipe(gulp.dest(path.build.html))
		.pipe(reload({stream:true}));
});

// Сборка CSS
gulp.task('style:build', function () {
	gulp.src(path.src.style)
		.pipe(plumber())
		.pipe(sourcemaps.init()) // Инициализируем sourcemap
		.pipe(sass())
		.pipe(prefixer({browsers: ['last 4 versions', 'ie 8']}))
		.pipe(minifyCSS())
		// .pipe(sourcemaps.write('./maps')) // Пропишем карты
		.pipe(rename({suffix: ".min"})) // Добавим суфикс для сжатого файла
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream:true}));
});

// Сборка JS
gulp.task('js:build', function () {
	gulp.src(path.src.scripts)
		// .pipe(plumber())
		// .pipe(jshint())
		.pipe(jshint.reporter("default"))
		// .pipe(uglify())
		.pipe(gulp.dest(path.build.js))
		.pipe(reload({stream:true}));
});


// Сжатие изображений
gulp.task('images:build', function () {
	gulp.src(path.src.images)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.build.img))
		.pipe(reload({stream:true}));
});


// Генерация спрайта, http://habrahabr.ru/post/227945/
gulp.task('sprite:build', function() {
	var spriteData = 
		gulp.src(path.src.spriteOrigin) // путь, откуда берем картинки для спрайта
			.pipe(plumber())
			.pipe(spritesmith({
				imgName: path.build.spriteImgName, // записывается в шаблон
				cssName: '_sprite-data.scss', // название файла с переменными
				cssFormat: 'scss', // формат css переменных
				algorithm: 'binary-tree',
				cssTemplate: 'sass.template.mustache', // файл шаблона с массивом данных для спрайта
				cssVarMap: function(sprite) {
					sprite.name = 's-' + sprite.name // префикс для переменных
				}
			}));

	spriteData.img.pipe(gulp.dest(path.build.spriteImgPath)); // путь, куда сохраняем картинку
	spriteData.css.pipe(gulp.dest(path.src.spriteSass)); // путь, куда сохраняем стили
});

// Копируем шрифты в папку build
gulp.task('fonts:build', function() {
	gulp.src(path.src.fonts)
		.pipe(plumber())
		.pipe(gulp.dest(path.build.fonts))
});

// Копируем видео в папку build
gulp.task('video:build', function() {
	gulp.src(path.src.video)
		.pipe(plumber())
		.pipe(gulp.dest(path.build.video))
});

// Такс запускает одной командой все предыдущие таски
gulp.task('build', [
	'html:build',
	'style:build',
	'js:build',
	'images:build',
	'sprite:build',
	'fonts:build',
	'video:build',
]);

// Следим за файлами
gulp.task('watch', function() {
	gulp.watch(path.watch.html, ['html:build'])
	gulp.watch(path.watch.style, ['style:build'])
	gulp.watch(path.watch.scripts, ['js:build'])
	gulp.watch(path.watch.images, ['images:build'])
	gulp.watch(path.watch.images, ['sprite:build'])
	gulp.watch(path.watch.fonts, ['fonts:build'])
	gulp.watch(path.watch.video, ['video:build'])
	// для отслеживания новых изображений, используется плагин gulp-watch
	watch([path.watch.images], function(event, cb) {
		gulp.start('images:build');
	});
});

// Если из рабочей папки images удалить изображения, они все равно останутся в папке build
// Очистим всю папку, после этого нужно будет перезапустить команду gulp
gulp.task('clean', function (cb) {
	rimraf(path.clean, cb);
});


// Запускаем всю сборку таском по умолчанию
gulp.task('default', ['build', 'webserver', 'watch']);