module.exports = function(grunt) {

	/* load the grunt tasks */
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-dust-html");
	grunt.loadNpmTasks("grunt-autoprefixer");

	/* require in the dust helpers */
	require("dustjs-helpers");

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			js: {
				expand: true,
				cwd: "src/js",
				src: "**",
				dest: "dist/js"
			},
			lib: {
				expand: true,
				cwd: "src/lib",
				src: "**",
				dest: "dist/lib"
			},
			docs: {
				expand: true,
				cwd: "src/docs",
				src: "**",
				dest: "dist/docs"
			},
			img: {
				expand: true,
				cwd: "src/img",
				src: "**",
				dest: "dist/img"
			}
		},
		dusthtml: {
			index: {
				src: "src/pages/index.dust",
				dest: "dist/index.html",
			},
			portfolio: {
				src: "src/pages/portfolio.dust",
				dest: "dist/portfolio.html",
			},
			UXapproach: {
				src: "src/pages/UXstrategy.dust",
				dest: "dist/UXstrategy.html",
			},
			options: {
				whitespace: true
			}
		},
		sass: {
			dev: {
				options: {
					style: 'expanded',
					compass: false
				},
				files: {
					'dist/css/base.css':'src/scss/base.scss',
					'dist/css/debbiebrasier.css':'src/scss/debbiebrasier.scss'
				}
			}
		},
		watch: {
			sass: {
				files: ["src/scss/**/*.scss"],
				tasks: ["sass"]
			},
			copy: {
				files: ["src/js/**", "src/lib/**", "src/docs/**", "src/img/**"],
				tasks: ["copy"]
			},
			template: {
				files: ["src/pages/**/*.dust", "src/pages/*.dust", "src/_templates/*.dust"],
				tasks: ["dusthtml", "sass", "copy"]
			}
		}

	});

	grunt.registerTask("default", ["dusthtml"]);
	grunt.registerTask("prod", ["sass:prod", "copy", "autoprefixer", "dusthtml"]);
};