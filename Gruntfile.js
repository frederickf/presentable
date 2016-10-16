module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '<%= grunt.file.read("LICENSE") %>'
            },
            license: {
                files: {
                    'dist/presentable.css': 'dist/presentable.css',
                    'dist/presentable.js': 'dist/presentable.js',
                    'dist/presentable.min.css': 'dist/presentable.min.css',
                    'dist/presentable.min.js': 'dist/presentable.min.js'
                }
            }
        },
        copy: {
            icons: {expand: true, cwd: 'src/', src: ['icons/**'], dest: 'dist/'},
            css: {expand: true, cwd: 'src/', src: 'presentable.css', dest: 'dist/'}

        },
        cssmin: {
            minify: {
                expand: true,
                cwd: 'src/',
                src: ['*.css', '!*.min.css'],
                dest: 'dist/',
                ext: '.min.css'
            }
        },
        jshint: {
            options: {
                browser: true,
                browserify: true,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                eqnull: true,
                globals: {
                    console: true
                },
                indent: 4,
                latedef: true,
                newcap: true,
                undef: true,
                unused: true
            },
            src: 'src/*.js'
        },
        browserify: {
            js: {
                files: {
                    'dist/presentable.js': 'src/main.js'
                },
                options: {
                    browserifyOptions: {
                        standalone: 'presentable'
                    }
                }
            }
        },
        uglify: {
            js: {
                files: {
                    'dist/presentable.min.js': 'dist/presentable.js'
                }
            }
          }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask("build", [
        'copy:icons',
        'copy:css',
        'cssmin:minify',
        'jshint:src',
        'browserify:js',
        'uglify:js',
        'concat:license'
    ]);

};