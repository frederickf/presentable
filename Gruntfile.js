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
                    findNestedDependencies: true,
                    baseUrl: 'src',
                    wrap: true,
                    preserveLicenseComments: false,
                    optimize: 'none',
                    mainConfigFile: 'src/requireConfig.js',
                    include: ['main'],
                    out: 'dist/presentable.js',
                    skipModuleInsertion: true,
                    onBuildWrite: function( name, path, contents ) {
                        return require('amdclean').clean(contents);
                    }
                }
            },
            js2: {
                options: {
                    findNestedDependencies: true,
                    baseUrl: 'src',
                    wrap: true,
                    preserveLicenseComments: false,
                    optimize: 'none',
                    mainConfigFile: 'src/requireConfig.js',
                    include: ['main'],
                    out: 'dist/presentable2.js',
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