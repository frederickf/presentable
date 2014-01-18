module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '<%= grunt.file.read("LICENSE") %>'
            },
            license: {
                files: {
                    'dist/presentable.min.css': 'dist/presentable.min.css',
                    'dist/presentable.min.js': 'dist/presentable.min.js'
                }
            }
        },
        copy: {
            icons: {expand: true, cwd: 'src/', src: ['icons/**'], dest: 'dist/'}
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
                camelcase: true,
                curly: true,
                eqeqeq: true,
                eqnull: true,
                globals: {
                    console: true,
                    define: true,
                    require: true,
                    requirejs: true
                },
                indent: 4,
                latedef: true,
                newcap: true,
                undef: true,
                unused: true
            },
            src: 'src/*.js'
        },
        requirejs: {
            js: {
                options: {
                    name: 'main',
                    baseUrl: 'src',
                    wrap: {
                        start: '(function(window, document) {',
                        end: '}(window, document) );'
                    },
                    //optimize: 'none',
                    mainConfigFile: 'src/requireConfig.js',
                    out: 'dist/presentable.min.js',
                    skipModuleInsertion: true,
                    onBuildWrite: function( name, path, contents ) {
                        return require('amdclean').clean(contents);
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask("build", [
        'copy:icons',
        'cssmin:minify',
        'jshint:src',
        'requirejs:js',
        'concat:license'
    ]);

};