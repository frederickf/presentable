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
            documentation: {
                options: {
                    noProcess: ['**/*.{png,gif,jpg,jpegico,psd}'],
                    process: function (content, srcPath) {
                        //return content.replace(/..\/..\/dist\//g, "../../presentable/");
                        return content.replace(/..\/..\/dist\//g, "../../presentable/");
                    }
                },
                files: [
                    {expand: true, cwd: 'dist/', src: ['**'], dest: 'documentation/presentable/'},
                    {expand: true, cwd: 'presentations/html5slides/', src: ['index-r21.html'], dest: 'documentation/supported-frameworks/html5slides/', rename: function(dest, src) {
                        return dest + 'index.html';
                    }},
                    {expand: true, cwd: 'presentations/impress.js-0.5.3/', src: ['**'], dest: 'documentation/supported-frameworks/impress.js/'},
                    {expand: true, cwd: 'presentations/', src: ['io-2012-slides/**'], dest: 'documentation/supported-frameworks/'},
                    {expand: true, cwd: 'presentations/shower-20131018-template/', src: ['**'], dest: 'documentation/supported-frameworks/shower/'},
                    {expand: true, cwd: 'presentations/reveal.js-2.6.1/', src: ['**'], dest: 'documentation/supported-frameworks/reveal.js/'}
                ]
            },
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