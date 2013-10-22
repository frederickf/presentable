module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
            presentable: ['presentable.js']
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
                    optimize: 'none',
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

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

};