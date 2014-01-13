module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            icons: {expand: true, cwd: 'src/', src: ['icons/**'], dest: 'dist/'}
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: 'src/',
                src: ['*.css', '!*.min.css'],
                dest: 'dist/',
                ext: '.css'
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                }
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
                    out: 'dist/presentable.js',
                    skipModuleInsertion: true,
                    onBuildWrite: function( name, path, contents ) {
                        return require('amdclean').clean(contents);
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask("build", [
        'copy:icons',
        'cssmin:minify',
        'jshint:src',
        'requirejs:js'
    ]);

};