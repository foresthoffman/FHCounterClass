module.exports = function( grunt ) {

	// load all tasks automagically
	require( 'load-grunt-tasks' )( grunt );

	// load timer plugin
	require( 'time-grunt' )( grunt );
	
	// all configurations
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		paths: {
			rel: '.',
			css: {
				dir: '<%= paths.rel %>/'
			},
			js: {
				dir: '<%= paths.rel %>/src',
				src: '<%= paths.js.dir %>',
				dist: '<%= paths.rel %>/dist',
				files: [
					'<%= paths.js.src %>/*.js',
					'<%= paths.js.src %>/**/*.js',
					'!<%= paths.js.dir %>/*.min.js',
					'!<%= paths.js.dir %>/**/*.min.js',
					'Gruntfile.js',
					'!node_modules/*.js',
					'!node_modules/*/**.js'
				]
			}
		},
		uglify: {
			options: {
				sourceMap: true,
				preserveComments: function ( node ) {
					if ( 0 !== node.start.comments_before.length && 'comment2' === node.start.comments_before[0].type ) {
						return true;
					} else {
						return false;
					}
				}
			},
			src: {
				files: [{
					expand: true,
					cwd: '<%= paths.js.src %>',
					src: '**/*.js',
					dest: '<%= paths.js.dist %>',
					ext: '.min.js'
				}]
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				browser: true,
				devel: true,
				undef: true,
				unused: false,
				globals: {
					'jQuery': true,
					'console': true,
					'module': true,
					'require': true,
					'wp': true,
					'FHCounterClass': true
				}
			},
			scripts: '<%= paths.js.files %>',
			gruntfile: [ 'Gruntfile.js' ]
		},
		watch: {
			js: {
				files: '<%= paths.js.files %>',
				tasks: ['jshint', 'uglify:src'],
				options: {
					spawn: false
				}
			}
		}
	});

	// continuous testing
	grunt.registerTask( 'dev', [ 'watch:js' ] );

	grunt.registerTask( 'build', [ 'jshint', 'uglify:src' ] );
	grunt.registerTask( 'ugly-js', [ 'uglify:src' ] );
	grunt.registerTask( 'lint', [ 'jshint:scripts' ] );
	grunt.registerTask( 'lint-grunt', [ 'jshint:gruntfile' ] );
};
