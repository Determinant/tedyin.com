module.exports = function(grunt) {
    var build_dir = './build';
    var src_dir = './src';
    function get_basename(flist) {
        return flist.map(function (cur, idx, arr) {
            return cur.replace(new RegExp('\.[^.]*$'), '');
        });
    }

    function gen_filename(prefix, ext, flist) {
        return flist.map(function (cur, idx, arr) {
            return prefix + '/' + cur + ext;
        });
    }

    function gen_mapping(ftype, src_ext, dest_ext, flist) {
        var mapping = {};
        flist.forEach(function (cur, idx, arr) {
            mapping[build_dir + '/' + ftype + '/' + cur + dest_ext] =
                src_dir + '/' + ftype + '/' + cur + src_ext;
        });
        return mapping;
    }
    var css_flist = ['normalize.css', 'pocketgrid.css', 'code.css', 'gist.css', 'theme.css'];
    var gphotos_css_flist = ['photoswipe.css', 'photoswipe-skin.css', 'gphotos.css'];
    var js_flist = ['all.js', 'gphotos.js'];
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            options: {
                sourcemap: "none"
            },
            build: {
                files: {
                    'src/css/theme.css': 'src/css/theme.scss',
                    'src/css/gphotos.css': 'src/css/gphotos.scss'
                }
            }
        },
        uglify: {
            main: {
                files: gen_mapping('js', '.js', '.min.js', get_basename(js_flist))
            },
            freewall: {
                files: [{'node_modules/freewall/freewall.min.js': 'node_modules/freewall/freewall.js'}]
            }
        },
        concat: {
            css: {
                files: {
                    'build/css/all.min.css': ['build/css/jquery.mCustomScrollbar.min.css',
                                            'build/css/jquery.mCustomScrollbar.override.min.css'].concat(
                                                gen_filename(build_dir + '/css', '.min.css', get_basename(css_flist))),
                    'build/css/gphotos_all.min.css': gen_filename(build_dir + '/css', '.min.css', get_basename(gphotos_css_flist))
                }
            }
        },
        cssmin: {
            mscrollbar: {
                files: {'build/css/jquery.mCustomScrollbar.min.css':
                        'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css',
                        'build/css/jquery.mCustomScrollbar.override.min.css':
                        'src/css/jquery.mCustomScrollbar.override.css'}
            },
            fonts: {
                files: {'build/fonts/fonts.min.css': 'src/fonts/fonts.css'}
            },
            gphotos: {
                files: gen_mapping('css', '.css', '.min.css', get_basename(gphotos_css_flist))
            },
            build: {
                files: gen_mapping('css', '.css', '.min.css', get_basename(css_flist))
            }
        },
        copy: {
            css: {
                options: {
                    timestamp: true
                },
                cwd: 'src/css/',
                src: '**/*.min.css',
                dest: 'build/css/',
                expand: true
            },
            js: {
                options: {
                    timestamp: true
                },
                cwd: 'src/js/',
                src: '**/*.min.js',
                dest: 'build/js/',
                expand: true
            },
            jquery: {
                options: {
                    timestamp: true
                },
                cwd: 'node_modules/jquery/dist/',
                src: 'jquery.min.js',
                dest: 'build/js/',
                expand: true
            },
            custom_scrollbar: {
                options: {
                    timestamp: true
                },
                src: 'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
                dest: 'build/js/jquery.mCustomScrollbar.min.js',
            },
            photoswipe: {
                options: {
                    timestamp: true
                },
                cwd: 'node_modules/photoswipe/dist/',
                src: ['photoswipe.min.js',
                      'photoswipe-ui-default.min.js'],
                dest: 'build/js/',
                expand: true
            },
            freewall: {
                options: {
                    timestamp: true
                },
                cwd: 'node_modules/freewall/',
                src: ['freewall.min.js'],
                dest: 'build/js/',
                expand: true
            },
            html5shiv: {
                options: {
                    timestamp: true
                },
                cwd: 'node_modules/html5shiv/dist/',
                src: ['html5shiv.min.js'],
                dest: 'build/js/',
                expand: true
            },
            respondjs: {
                options: {
                    timestamp: true
                },
                cwd: 'node_modules/respond.js/dest/',
                src: ['respond.min.js'],
                dest: 'build/js/',
                expand: true
            },
            fonts: {
                options: {
                    timestamp: true
                },
                cwd: 'src/fonts/',
                src: '**/*.{svg,eot,ttf,woff,woff2}',
                dest: 'build/fonts/',
                expand: true
            },
            image: {
                options: {
                    timestamp: true
                },
                cwd: 'src/css/images/',
                src: '*',
                dest: 'build/css/images/',
                expand: true
            }
        },
        watch: {
            fonts: {
                files: ['src/fonts/**/*.{svg,eot,ttf,woff,woff2}'],
                tasks: ['copy:fonts']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-newer');
    grunt.registerTask('default', ['newer:uglify', 'newer:sass', 'newer:cssmin', 'newer:copy', 'newer:concat']);
};
